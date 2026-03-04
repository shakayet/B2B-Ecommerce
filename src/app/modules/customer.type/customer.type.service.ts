import { CustomerTypeModel } from './customer.type.model';
import { ICustomerType } from './customer.type.interface';

const createCustomerTypeToDB = async (payload: ICustomerType) => {
  return await CustomerTypeModel.create(payload);
};

const getAllCustomerTypesFromDB = async (searchTerm?: string) => {
  const query: any = {};

  if (searchTerm) {
    query.customerType = {
      $regex: searchTerm,
      $options: 'i',
    };
  }

  return await CustomerTypeModel.find(query).sort({ createdAt: -1 });
};

const getSingleCustomerTypeFromDB = async (id: string) => {
  return await CustomerTypeModel.findById(id);
};

const updateCustomerTypeToDB = async (
  id: string,
  payload: Partial<ICustomerType>
) => {
  return await CustomerTypeModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const deleteCustomerTypeFromDB = async (id: string) => {
  return await CustomerTypeModel.findByIdAndDelete(id);
};

export const CustomerTypeService = {
  createCustomerTypeToDB,
  getAllCustomerTypesFromDB,
  getSingleCustomerTypeFromDB,
  updateCustomerTypeToDB,
  deleteCustomerTypeFromDB,
};
