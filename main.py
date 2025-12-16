import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from config import APP_TITLE, APP_SIZE, COLORS
from data_manager import DataManager
from auth_manager import AuthManager
from ui.tabs.pedidos import PedidosTab
from ui.tabs.inventario import InventarioTab
from ui.tabs.historial import HistorialTab
from ui.admin_panel import AdminPanel
from ui.login_window import LoginWindow
from utils.exporters import generate_pdf_report, export_csv_history
from utils.plugin_loader import load_converters
import os
import csv
import tempfile

class HeladeriaApp:
    def __init__(self, root):
        self.root = root
        self.root.withdraw() # Hide main window until login
        
        self.data_manager = DataManager()
        self.auth_manager = AuthManager()
        self.plugins = load_converters()
        self.current_user = None
        
        self.show_login()

    def show_login(self):
        LoginWindow(self.root, self.auth_manager, self.on_login_success)

    def on_login_success(self, user):
        self.current_user = user
        self.root.deiconify() # Show main window
        self.setup_main_window()

    def setup_main_window(self):
        self.root.title(f"{APP_TITLE} - Usuario: {self.current_user.username} ({self.current_user.role})")
        self.root.geometry("900x600")
        
        # Cleanup previous widgets if re-logging
        for widget in self.root.winfo_children():
            if isinstance(widget, tk.Toplevel): continue
            widget.destroy()

        self.setup_ui()

    def setup_ui(self):
        # Main Layout: Sidebar (Left) + Content (Right)
        self.sidebar = tk.Frame(self.root, bg=COLORS["primary"], width=200, padx=10, pady=20)
        self.sidebar.pack(side="left", fill="y")
        self.sidebar.pack_propagate(False) # Fixed width

        self.content = tk.Frame(self.root, bg=COLORS["white"])
        self.content.pack(side="right", fill="both", expand=True)

        # --- Sidebar Content ---
        
        # Logo
        try:
            self.logo_img = tk.PhotoImage(file="assets/logo.png")
            # Resize if necessary
            self.logo_img = self.logo_img.subsample(2, 2) 
            logo_label = tk.Label(self.sidebar, image=self.logo_img, bg=COLORS["primary"])
            logo_label.pack(pady=(0, 20))
        except Exception as e:
            tk.Label(self.sidebar, text="🍦", font=("Arial", 40), bg=COLORS["primary"], fg=COLORS["white"]).pack(pady=(0, 20))

        # Title
        tk.Label(self.sidebar, text="Sabor Nórdico", font=("Helvetica", 14, "bold"), bg=COLORS["primary"], fg=COLORS["white"]).pack(pady=(0, 20))

        # Navigation Buttons
        self.nav_buttons = {}
        
        self.create_nav_btn("Realizar Pedido", lambda: self.show_view("pedidos"))
        self.create_nav_btn("Inventario", lambda: self.show_view("inventario"))
        self.create_nav_btn("Historial", lambda: self.show_view("historial"))
        
        # Admin Only Button
        if self.current_user.role == "admin":
             self.create_nav_btn("Usuarios (Admin)", lambda: self.show_view("admin"))

        tk.Frame(self.sidebar, height=2, bg=COLORS["secondary"]).pack(fill="x", pady=20)
        
        # Export Menu in Sidebar
        export_label = tk.Label(self.sidebar, text="Exportar", font=("Helvetica", 10, "bold"), bg=COLORS["primary"], fg=COLORS["secondary"], anchor="w")
        export_label.pack(fill="x", pady=(10, 5))
        
        self.create_small_btn("PDF Reporte", lambda: generate_pdf_report(self.data_manager))
        self.create_small_btn("CSV Historial", lambda: export_csv_history(self.data_manager))
        
        # Plugins
        if self.plugins:
            tk.Label(self.sidebar, text="Plugins", font=("Helvetica", 10, "bold"), bg=COLORS["primary"], fg=COLORS["secondary"], anchor="w").pack(fill="x", pady=(15, 5))
            for name, func in self.plugins.items():
                self.create_small_btn(name, lambda f=func, n=name: self.run_plugin(f, n))
                
        # Logout
        tk.Frame(self.sidebar, height=2, bg=COLORS["secondary"]).pack(fill="x", pady=20)
        self.create_nav_btn("Cerrar Sesión", self.logout)
        self.create_nav_btn("Salir", self.confirm_exit)

        # Initialize Views
        self.views = {}
        
        # Callbacks
        def on_order_placed():
            self.views["inventario"].update_table()
            self.views["historial"].update_table()
            if "pedidos" in self.views: self.views["pedidos"].refresh_sabores_ui()

        def on_restock():
            if "pedidos" in self.views: self.views["pedidos"].refresh_sabores_ui()

        self.views["pedidos"] = PedidosTab(self.content, self.data_manager, update_callbacks=[on_order_placed])
        self.views["inventario"] = InventarioTab(self.content, self.data_manager, update_callback=on_restock)
        self.views["historial"] = HistorialTab(self.content, self.data_manager)
        
        if self.current_user.role == "admin":
            self.views["admin"] = AdminPanel(self.content, self.auth_manager)

        self.show_view("pedidos")

    def create_nav_btn(self, text, command):
        btn = tk.Button(self.sidebar, text=text, font=("Helvetica", 11), bg=COLORS["primary"], fg=COLORS["white"], 
                        activebackground=COLORS["secondary"], activeforeground=COLORS["primary"],
                        bd=0, pady=10, command=command, anchor="w", padx=10)
        btn.pack(fill="x", pady=2)
        self.nav_buttons[text] = btn

    def create_small_btn(self, text, command):
        btn = tk.Button(self.sidebar, text=f"• {text}", font=("Helvetica", 9), bg=COLORS["primary"], fg=COLORS["white"], 
                        activebackground=COLORS["secondary"], activeforeground=COLORS["primary"],
                        bd=0, command=command, anchor="w", padx=15)
        btn.pack(fill="x")

    def show_view(self, view_name):
        # Hide all
        for view in self.views.values():
            view.pack_forget()
        
        # Show selected
        if view_name in self.views:
            self.views[view_name].pack(fill="both", expand=True)

    def logout(self):
        self.current_user = None
        self.root.withdraw()
        self.show_login()

    def confirm_exit(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("Confirmar")
        dialog.geometry("350x160")
        dialog.configure(bg=COLORS["white"])
        dialog.resizable(False, False)
        
        # Center relative to parent
        try:
            x = self.root.winfo_x() + (self.root.winfo_width() // 2) - 175
            y = self.root.winfo_y() + (self.root.winfo_height() // 2) - 80
            dialog.geometry(f"+{x}+{y}")
        except:
            pass # Fallback if geometry calc fails
            
        dialog.transient(self.root)
        dialog.grab_set()
        
        tk.Label(dialog, text="¿Quieres salir de la aplicación?", font=("Helvetica", 12), 
                 bg=COLORS["white"], fg=COLORS["text"]).pack(pady=25)
        
        btn_frame = tk.Frame(dialog, bg=COLORS["white"])
        btn_frame.pack(pady=5)
        
        tk.Button(btn_frame, text="Salir", command=self.root.destroy,
                  bg=COLORS["primary"], fg=COLORS["white"], 
                  font=("Helvetica", 10, "bold"), bd=0, padx=20, pady=8, cursor="hand2").pack(side="left", padx=10)
                  
        tk.Button(btn_frame, text="Cancelar", command=dialog.destroy,
                  bg=COLORS["secondary"], fg=COLORS["text"], 
                  font=("Helvetica", 10), bd=0, padx=20, pady=8, cursor="hand2").pack(side="left", padx=10)

    def run_plugin(self, convert_func, name):
        if not self.data_manager.historial_pedidos:
            messagebox.showinfo("Exportar", "No hay datos para exportar.")
            return

        try:
            with tempfile.NamedTemporaryFile(mode='w', delete=False, newline='', encoding='utf-8', suffix='.csv') as tmp:
                writer = csv.writer(tmp)
                writer.writerow(["ID", "Fecha", "Sabor", "Envase", "Toppings", "Cantidad", "Total"])
                for p in self.data_manager.historial_pedidos:
                    writer.writerow([
                        p["id"], p["fecha"], p["sabor"], p["envase"], 
                        ", ".join(p["toppings"]), p["cantidad"], p["total"]
                    ])
                tmp_path = tmp.name

            ext = ".json" if "JSON" in name else ".sql" if "SQL" in name else ".txt"
            output_path = filedialog.asksaveasfilename(defaultextension=ext, filetypes=[(f"{name} file", f"*{ext}")])
            
            if output_path:
                success, msg = convert_func(tmp_path, output_path)
                if success:
                    messagebox.showinfo("Plugin Éxito", f"{msg}\nGuardado en: {output_path}")
                else:
                    messagebox.showerror("Plugin Error", msg)
            
            os.remove(tmp_path)

        except Exception as e:
            messagebox.showerror("Error", f"Error ejecutando plugin: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = HeladeriaApp(root)
    root.mainloop()
