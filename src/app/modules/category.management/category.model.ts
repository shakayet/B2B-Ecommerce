import { Schema, model } from 'mongoose';
import { ICategory } from './category.inteface';


/**
 * Mongoose schema for Category collection
 */
const categorySchema = new Schema<ICategory>(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

/**
 * Category Model
 */
export const CategoryModel = model<ICategory>('CategoryManagement', categorySchema);
