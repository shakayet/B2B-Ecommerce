import { model, Schema } from "mongoose";
import { ICustomerType } from "./customer.type.interface";


export interface ICustomerTypeDocument extends ICustomerType, Document {}

const customerTypeSchema = new Schema<ICustomerTypeDocument>(
  {
    customerType: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CustomerTypeModel = model<ICustomerTypeDocument>(
  "CustomerType",
  customerTypeSchema
);
