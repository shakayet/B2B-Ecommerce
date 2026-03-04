import { ICategory } from "./category.inteface";
import { CategoryModel} from "./category.model";


/**
 * Service layer handles all DB operations
 */
const createCategoryToDB = async (payload: ICategory) => {
  const result = await CategoryModel.create(payload);
  return result;
};


/**
 * Get all categories with product count
 */
const getAllCategoriesFromDB = async () => {
  const result = await CategoryModel.aggregate([
    {
      $lookup: {
        from: 'productandcatelogs',
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$categoryId', '$$categoryId'], 
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'productData',
      },
    },
    {
      $addFields: {
        productCount: {
          $ifNull: [{ $arrayElemAt: ['$productData.count', 0] }, 0],
        },
      },
    },
    {
      $project: { productData: 0 },
    },
  ]);

  return result;
};


const getSingleCategoryFromDB = async (id: string) => {
  const result = await CategoryModel.findById(id);
  return result;
};

const updateCategoryToDB = async (id: string, payload: Partial<ICategory>) => {
  const result = await CategoryModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteCategoryFromDB = async (id: string) => {
  const result = await CategoryModel.findByIdAndDelete(id);
  return result;
};

export const CategoryService = {
  createCategoryToDB,
  getAllCategoriesFromDB,
  getSingleCategoryFromDB,
  updateCategoryToDB,
  deleteCategoryFromDB,
};
