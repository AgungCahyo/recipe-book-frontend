//context/ingredients/utils/parsers.ts

import uuid from 'react-native-uuid';
import { Ingredient } from '../IngredientsProvider';

export function parseIngredientFromCSV(item: {
  name: string;
  quantity: string;
  totalPrice: string;
  unit: string;
}): Ingredient | null {
  const name = item.name?.trim();
  const qty = parseFloat(item.quantity);
  const price = parseFloat(item.totalPrice);
  const unit = item.unit?.trim();

  if (!name || !unit || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
    return null;
  }

  const id = uuid.v4() as string;
  const pricePerUnit = parseFloat((price / qty).toFixed(2));

  return { id, name, quantity: qty, totalPrice: price, unit, pricePerUnit };
}
