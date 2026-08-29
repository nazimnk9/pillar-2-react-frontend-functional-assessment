import { NextResponse } from "next/server";
import { Product } from "@/types";

// In-memory mock database that persists during the server's lifecycle
let productsList: Product[] = [
  {
    id: 1,
    name: "MacBook Pro M2",
    category: "Laptops",
    price: 2499,
    stock: 8,
    image: "/assets/images/macbook-pro-m2.jpg",
  },
  {
    id: 2,
    name: "Logitech MX Master 3",
    category: "Accessories",
    price: 99,
    stock: 0,
    image: "/assets/images/logitech-mx-master.jpg",
  },
  {
    id: 3,
    name: "Dell XPS 15",
    category: "Laptops",
    price: 1899,
    stock: 3,
    image: "/assets/images/dell-xps-15.jpg",
  },
];

export async function GET() {
  // Simulate network latency (500ms) to show skeleton loader
  await new Promise((resolve) => setTimeout(resolve, 500));
  return NextResponse.json(productsList);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, items } = body;

    // Simulate network latency for checkout
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (action === "checkout") {
      // Validate stock for all items
      for (const item of items) {
        const product = productsList.find((p) => p.id === item.id);
        if (!product) {
          return NextResponse.json(
            { error: `Product with ID ${item.id} not found.` },
            { status: 400 }
          );
        }
        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name}.` },
            { status: 400 }
          );
        }
      }

      // Decrement stock
      productsList = productsList.map((product) => {
        const cartItem = items.find((item: { id: number; quantity: number }) => item.id === product.id);
        if (cartItem) {
          return {
            ...product,
            stock: product.stock - cartItem.quantity,
          };
        }
        return product;
      });

      return NextResponse.json({ success: true, message: "Checkout successful!" });
    }

    if (action === "restock") {
      // Restock helper for testing and development
      productsList = productsList.map((product) => {
        const item = items.find((i: { id: number; stock: number }) => i.id === product.id);
        if (item) {
          return { ...product, stock: item.stock };
        }
        return product;
      });
      return NextResponse.json({ success: true, products: productsList });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
