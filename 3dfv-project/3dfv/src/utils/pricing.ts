import { CartItem, MenuItem } from '../types';

export type PortionOption = {
  label: string;
  price: number;
};

export function isPizzaItem(item: MenuItem) {
  return `${item.category} ${item.name}`.toLowerCase().includes('pizza');
}

export function getDefaultPortion(item: MenuItem) {
  return isPizzaItem(item) ? 'Medium' : 'Standard';
}

export function getPortionOptions(item: MenuItem): PortionOption[] {
  if (!isPizzaItem(item)) {
    return [
      { label: 'Petite', price: item.price },
      { label: 'Standard', price: item.price },
      { label: 'Grand', price: item.price },
    ];
  }

  return [
    { label: 'Small', price: Math.max(0, item.price - 250) },
    { label: 'Medium', price: item.price },
    { label: 'Large', price: item.price + 400 },
  ];
}

export function getPortionPrice(item: MenuItem, portion: string) {
  return getPortionOptions(item).find((option) => option.label === portion)?.price ?? item.price;
}

export function getCartLinePrice(line: CartItem) {
  return line.unitPrice ?? getPortionPrice(line.item, line.portion);
}
