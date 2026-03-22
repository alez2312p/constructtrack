export interface Category {
  id: string;
  name: string;
}
export interface Location {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  categoryId: string | null;
  locationId: string | null;
  active?: boolean;
  category?: { name: string } | null;
  location?: { name: string } | null;
}

export interface CommonProps {
  userId?: string;
  categories: Category[];
  locations: Location[];
  handleDelete: (id: string) => void;
}

export interface InventoryListProps extends Omit<CommonProps, "handleDelete"> {
  materials: Material[];
  initialSearch?: string;
  initialFilter?: string;
  hasNextPage?: boolean;
  nextCursor?: string | null;
  limit?: number;
  totalCount?: number;
}

export interface StockAlert {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
}

export interface StockAlertsProps {
  alerts: StockAlert[];
  userId: string;
}

export interface MaterialFormProps {
  material?: Material;
  userId?: string;
  trigger?: React.ReactNode;
  categories?: Category[];
  locations?: Location[];
}

export interface MovementData {
  id: string;
  type: "IN" | "OUT";
  quantity: number;
  date: Date;
  notes: string | null;
  material: Material;
  user: User;
}
