import { ProductModel } from './product.model';
import { IProduct } from './product.interface';
import { User } from '../user/user.model';
import { QuickBooksService } from '../quickbook/quickbook.service';
import session from 'express-session';
import { QuickBooksToken } from '../quickbook/quickbooksToken.model';
const quickBooksService = new QuickBooksService();

const createProductToDB = async (payload: IProduct) => {
  const existingProduct = await ProductModel.findOne({ sku: payload.sku });
  if (existingProduct) {
    throw new Error('Product with this SKU already exists');
  }
  const product = await ProductModel.create(payload);
  // Sync with QuickBooks
  const token = await quickBooksService.getValidToken();
  try {
    const qbItemId = await quickBooksService.createItem(
      product,
      token?.realmId || '',
      token?.accessToken || '',
    );
    product.quickbooksId = qbItemId;
    await product.save();
  } catch (error) {
    console.error('Failed to sync product with QuickBooks:', error);
  }
  return product;
};

const getAllProductsFromDB = async (query: any) => {
  const { search, category, page, limit } = query;
  console.log(query);

  const filter: any = {};

  // 🔍 Search by product name
  if (search) {
    filter.productName = { $regex: search, $options: 'i' };
  }

  // 🏷️ Filter by category
  if (category) {
    filter.category = { $regex: category, $options: 'i' };
  }

  // 📄 Pagination
  const skip = (Number(page) - 1) * Number(limit);

  const products = await ProductModel.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  // 🟢 Add availability status
  const data = products.map(product => {
    let status = 'Available';

    if (product.stock === 0) {
      status = 'Out of Stock';
    } else if (product.stock <= 10) {
      status = 'Limited Stock';
    }

    return {
      ...product.toObject(),
      status,
    };
  });

  const total = await ProductModel.countDocuments(filter);

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data,
  };
};

const getSingleProductFromDB = async (id: string) => {
  return await ProductModel.findById(id);
};

const updateProductToDB = async (id: string, payload: Partial<IProduct>) => {
  return await ProductModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const deleteProductFromDB = async (id: string) => {
  return await ProductModel.findByIdAndDelete(id);
};

const getAllProductsCategoryFromDB = async () => {
  return await ProductModel.find().distinct('category');
};

const getAllProductsByCustomerTypeFromDB = async (
  query: any,
  userId: string,
) => {
  const { search, category, page = 1, limit = 16 } = query;
  const filter: any = {};

  if (search) filter.productName = { $regex: search, $options: 'i' };
  if (category) filter.category = { $regex: category, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);

  // 🧑 Get user's customer type
  const user = await User.findById({ _id: userId })
    .select('customerType')
    .lean();
  const customerType = user?.customerType;

  const products = await ProductModel.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .lean();

  const data = products.map(product => {
    let status = 'Available';
    if (product.stock === 0) status = 'Out of Stock';
    else if (product.stock <= 10) status = 'Limited Stock';
    console.log('Customer Type:', customerType);

    // ⭐ Find matching price tier
    const matchedTier = product.customerTypePrice?.find(
      (tier: any) =>
        tier.categoryName?.trim().toLowerCase() ===
        customerType?.trim().toLowerCase(),
    );
    console.log('Matched Tier:', matchedTier);
    return {
      ...product,
      price: matchedTier ? Number(matchedTier.price) : product.basePrice,
      status,
    };
  });

  const total = await ProductModel.countDocuments(filter);

  return {
    meta: { page: Number(page), limit: Number(limit), total },
    data,
  };
};

export const ProductService = {
  createProductToDB,
  getAllProductsFromDB,
  getAllProductsCategoryFromDB,
  getAllProductsByCustomerTypeFromDB,
  getSingleProductFromDB,
  updateProductToDB,
  deleteProductFromDB,
};
