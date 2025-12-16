import csv
import os

class DataManager:
    def __init__(self):
        self.csv_file = "data/inventario.csv"
        self.inventario = {
            "sabores": [],
            "envases": [],
            "toppings": []
        }
        self.historial_pedidos = []
        self.load_inventory()

    def load_inventory(self):
        if not os.path.exists(self.csv_file):
            return

        try:
            with open(self.csv_file, mode='r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    category = row['categoria']
                    item = {
                        "precio": float(row['precio']),
                        "stock": int(row['stock'])
                    }
                    
                    if category == "sabores":
                        item["nombre"] = row['nombre']
                        item["disponible"] = item["stock"] > 0
                        self.inventario["sabores"].append(item)
                    elif category == "envases":
                        item["tipo"] = row['nombre'] # Map 'nombre' to 'tipo' for envases
                        self.inventario["envases"].append(item)
                    elif category == "toppings":
                        item["nombre"] = row['nombre']
                        self.inventario["toppings"].append(item)
        except Exception as e:
            print(f"Error loading inventory: {e}")

    def save_inventory(self):
        try:
            with open(self.csv_file, mode='w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                writer.writerow(["categoria", "nombre", "precio", "stock"])
                
                for s in self.inventario["sabores"]:
                    writer.writerow(["sabores", s["nombre"], s["precio"], s["stock"]])
                
                for e in self.inventario["envases"]:
                    writer.writerow(["envases", e["tipo"], e["precio"], e["stock"]])
                    
                for t in self.inventario["toppings"]:
                    writer.writerow(["toppings", t["nombre"], t["precio"], t["stock"]])
        except Exception as e:
            print(f"Error saving inventory: {e}")

    def update_stock(self, category, item_name, quantity_change):
        items = self.inventario.get(category)
        if not items: return
        
        name_key = "nombre" if category != "envases" else "tipo"
        
        idx = next((i for i, item in enumerate(items) if item[name_key] == item_name), -1)
        if idx != -1:
            items[idx]["stock"] += quantity_change
            if category == "sabores":
                items[idx]["disponible"] = items[idx]["stock"] > 0
            self.save_inventory()

    def add_order(self, order_data):
        self.historial_pedidos.append(order_data)

    def restock_all(self, quantity):
        for cat in ["sabores", "envases", "toppings"]:
            for item in self.inventario[cat]:
                item["stock"] += quantity
                if cat == "sabores":
                    item["disponible"] = True
        self.save_inventory()

    def import_from_csv(self, filepath):
        try:
            with open(filepath, mode='r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                count = 0
                for row in reader:
                    category = row['categoria'].lower()
                    if category not in self.inventario: continue
                    
                    name = row['nombre']
                    try:
                        price = float(row['precio'])
                        stock = int(row['stock'])
                    except ValueError:
                        continue

                    # Check if exists to update, else append
                    items = self.inventario[category]
                    name_key = "nombre" if category != "envases" else "tipo"
                    
                    existing = next((i for i in items if i[name_key] == name), None)
                    
                    if existing:
                        existing["stock"] += stock
                        # Optional: Update price if needed, currently only stock accumulates
                    else:
                        new_item = {
                            "precio": price,
                            "stock": stock
                        }
                        if category == "envases":
                            new_item["tipo"] = name
                        else:
                            new_item["nombre"] = name
                            if category == "sabores":
                                new_item["disponible"] = stock > 0
                        items.append(new_item)
                    count += 1
                
                self.save_inventory()
                return count
        except Exception as e:
            print(f"Error importing CSV: {e}")
            return -1
