import React, { useState } from 'react';
import { ShoppingCart, Package, DollarSign, MapPin, IceCream } from 'lucide-react';

const HeladeriaApp = () => {
  const [inventario, setInventario] = useState({
    sabores: [
      { nombre: 'Vainilla Nórdica', precio: 3.50, stock: 50, disponible: true },
      { nombre: 'Chocolate Ártico', precio: 4.00, stock: 45, disponible: true },
      { nombre: 'Fresa Glacial', precio: 3.75, stock: 30, disponible: true },
      { nombre: 'Menta Polar', precio: 4.25, stock: 25, disponible: true },
      { nombre: 'Caramelo Vikingo', precio: 4.50, stock: 20, disponible: true }
    ],
    envases: [
      { tipo: 'Cono', precio: 0.50, stock: 100 },
      { tipo: 'Copa', precio: 0.75, stock: 80 },
      { tipo: 'Tarrina', precio: 1.00, stock: 60 }
    ],
    toppings: [
      { nombre: 'Chispas de chocolate', precio: 0.50, stock: 50 },
      { nombre: 'Nueces', precio: 0.75, stock: 40 },
      { nombre: 'Caramelo líquido', precio: 0.60, stock: 45 },
      { nombre: 'Frutas frescas', precio: 1.00, stock: 30 }
    ]
  });

  const [pedidoActual, setPedidoActual] = useState({
    sabor: null,
    envase: null,
    toppings: [],
    cantidad: 1
  });

  const [vista, setVista] = useState('pedidos');
  const [historialPedidos, setHistorialPedidos] = useState([]);
  const [mercanciaRecibida, setMercanciaRecibida] = useState('');

  const ubicaciones = [
    'Centro Comercial Aurora',
    'Plaza del Sol',
    'Avenida Principal 123'
  ];

  const slogan = "¡Sabores del Norte, Frescura sin igual!";

  const calcularTotal = () => {
    let total = 0;
    if (pedidoActual.sabor) {
      const sabor = inventario.sabores.find(s => s.nombre === pedidoActual.sabor);
      total += sabor.precio;
    }
    if (pedidoActual.envase) {
      const envase = inventario.envases.find(e => e.tipo === pedidoActual.envase);
      total += envase.precio;
    }
    pedidoActual.toppings.forEach(topping => {
      const top = inventario.toppings.find(t => t.nombre === topping);
      total += top.precio;
    });
    return (total * pedidoActual.cantidad).toFixed(2);
  };

  const realizarPedido = () => {
    if (!pedidoActual.sabor || !pedidoActual.envase) {
      alert('Por favor selecciona un sabor y un envase');
      return;
    }

    const nuevoInventario = { ...inventario };
    
    // Actualizar stock
    const saborIdx = nuevoInventario.sabores.findIndex(s => s.nombre === pedidoActual.sabor);
    nuevoInventario.sabores[saborIdx].stock -= pedidoActual.cantidad;
    if (nuevoInventario.sabores[saborIdx].stock <= 0) {
      nuevoInventario.sabores[saborIdx].disponible = false;
    }

    const envaseIdx = nuevoInventario.envases.findIndex(e => e.tipo === pedidoActual.envase);
    nuevoInventario.envases[envaseIdx].stock -= pedidoActual.cantidad;

    pedidoActual.toppings.forEach(topping => {
      const topIdx = nuevoInventario.toppings.findIndex(t => t.nombre === topping);
      nuevoInventario.toppings[topIdx].stock -= pedidoActual.cantidad;
    });

    setInventario(nuevoInventario);

    const pedido = {
      ...pedidoActual,
      total: calcularTotal(),
      fecha: new Date().toLocaleString(),
      id: Date.now()
    };

    setHistorialPedidos([...historialPedidos, pedido]);
    setPedidoActual({ sabor: null, envase: null, toppings: [], cantidad: 1 });
    alert(`Pedido realizado! Total: $${pedido.total}`);
  };

  const recibirMercancia = () => {
    if (!mercanciaRecibida) return;

    const nuevoInventario = { ...inventario };
    const cantidad = parseInt(mercanciaRecibida) || 10;

    nuevoInventario.sabores.forEach(sabor => {
      sabor.stock += cantidad;
      sabor.disponible = true;
    });

    nuevoInventario.envases.forEach(envase => {
      envase.stock += cantidad;
    });

    nuevoInventario.toppings.forEach(topping => {
      topping.stock += cantidad;
    });

    setInventario(nuevoInventario);
    setMercanciaRecibida('');
    alert(`Mercancía recibida: +${cantidad} unidades a todos los productos`);
  };

  const toggleTopping = (topping) => {
    if (pedidoActual.toppings.includes(topping)) {
      setPedidoActual({
        ...pedidoActual,
        toppings: pedidoActual.toppings.filter(t => t !== topping)
      });
    } else {
      setPedidoActual({
        ...pedidoActual,
        toppings: [...pedidoActual.toppings, topping]
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <IceCream className="text-cyan-600" size={40} />
            <h1 className="text-4xl font-bold text-cyan-800">Heladería Sabor Nórdico</h1>
          </div>
          <p className="text-cyan-600 italic text-lg">{slogan}</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-gray-600">
            <MapPin size={16} />
            <span className="text-sm">{ubicaciones.join(' • ')}</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setVista('pedidos')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              vista === 'pedidos'
                ? 'bg-cyan-600 text-white'
                : 'bg-white text-cyan-600 hover:bg-cyan-50'
            }`}
          >
            <ShoppingCart className="inline mr-2" size={20} />
            Realizar Pedido
          </button>
          <button
            onClick={() => setVista('inventario')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              vista === 'inventario'
                ? 'bg-cyan-600 text-white'
                : 'bg-white text-cyan-600 hover:bg-cyan-50'
            }`}
          >
            <Package className="inline mr-2" size={20} />
            Inventario
          </button>
          <button
            onClick={() => setVista('historial')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              vista === 'historial'
                ? 'bg-cyan-600 text-white'
                : 'bg-white text-cyan-600 hover:bg-cyan-50'
            }`}
          >
            <DollarSign className="inline mr-2" size={20} />
            Historial
          </button>
        </div>

        {/* Vista Pedidos */}
        {vista === 'pedidos' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-xl mb-4 text-cyan-800">Selecciona tu Sabor</h3>
                {inventario.sabores.map((sabor) => (
                  <button
                    key={sabor.nombre}
                    onClick={() => setPedidoActual({ ...pedidoActual, sabor: sabor.nombre })}
                    disabled={!sabor.disponible}
                    className={`w-full p-3 mb-2 rounded-lg text-left transition ${
                      pedidoActual.sabor === sabor.nombre
                        ? 'bg-cyan-600 text-white'
                        : sabor.disponible
                        ? 'bg-gray-50 hover:bg-cyan-50'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{sabor.nombre}</span>
                      <span>${sabor.precio.toFixed(2)}</span>
                    </div>
                    <div className="text-sm opacity-75">Stock: {sabor.stock}</div>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-xl mb-4 text-cyan-800">Elige tu Envase</h3>
                {inventario.envases.map((envase) => (
                  <button
                    key={envase.tipo}
                    onClick={() => setPedidoActual({ ...pedidoActual, envase: envase.tipo })}
                    className={`w-full p-3 mb-2 rounded-lg text-left transition ${
                      pedidoActual.envase === envase.tipo
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-50 hover:bg-cyan-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{envase.tipo}</span>
                      <span>+${envase.precio.toFixed(2)}</span>
                    </div>
                    <div className="text-sm opacity-75">Stock: {envase.stock}</div>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-xl mb-4 text-cyan-800">Toppings (Opcional)</h3>
                {inventario.toppings.map((topping) => (
                  <button
                    key={topping.nombre}
                    onClick={() => toggleTopping(topping.nombre)}
                    className={`w-full p-3 mb-2 rounded-lg text-left transition ${
                      pedidoActual.toppings.includes(topping.nombre)
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-50 hover:bg-cyan-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{topping.nombre}</span>
                      <span>+${topping.precio.toFixed(2)}</span>
                    </div>
                    <div className="text-sm opacity-75">Stock: {topping.stock}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-6">
              <h3 className="font-bold text-xl mb-4 text-cyan-800">Resumen del Pedido</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="font-semibold">Sabor:</span>
                  <span>{pedidoActual.sabor || 'No seleccionado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Envase:</span>
                  <span>{pedidoActual.envase || 'No seleccionado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Toppings:</span>
                  <span>{pedidoActual.toppings.length > 0 ? pedidoActual.toppings.join(', ') : 'Ninguno'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Cantidad:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPedidoActual({ ...pedidoActual, cantidad: Math.max(1, pedidoActual.cantidad - 1) })}
                      className="bg-gray-200 px-3 py-1 rounded"
                    >
                      -
                    </button>
                    <span className="px-4 py-1">{pedidoActual.cantidad}</span>
                    <button
                      onClick={() => setPedidoActual({ ...pedidoActual, cantidad: pedidoActual.cantidad + 1 })}
                      className="bg-gray-200 px-3 py-1 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-2xl font-bold text-cyan-800">
                  <span>Total:</span>
                  <span>${calcularTotal()}</span>
                </div>
              </div>

              <button
                onClick={realizarPedido}
                className="w-full bg-cyan-600 text-white py-3 rounded-lg font-bold hover:bg-cyan-700 transition"
              >
                Realizar Pedido
              </button>
            </div>
          </div>
        )}

        {/* Vista Inventario */}
        {vista === 'inventario' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-xl mb-4 text-cyan-800">Recibir Mercancía</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={mercanciaRecibida}
                  onChange={(e) => setMercanciaRecibida(e.target.value)}
                  placeholder="Cantidad a agregar"
                  className="flex-1 border rounded-lg px-4 py-2"
                />
                <button
                  onClick={recibirMercancia}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Recibir
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-xl mb-4 text-cyan-800">Inventario de Sabores</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-cyan-50">
                    <tr>
                      <th className="p-3 text-left">Sabor</th>
                      <th className="p-3 text-right">Precio</th>
                      <th className="p-3 text-right">Stock</th>
                      <th className="p-3 text-center">Disponible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventario.sabores.map((sabor) => (
                      <tr key={sabor.nombre} className="border-b">
                        <td className="p-3">{sabor.nombre}</td>
                        <td className="p-3 text-right">${sabor.precio.toFixed(2)}</td>
                        <td className="p-3 text-right">{sabor.stock}</td>
                        <td className="p-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm ${sabor.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {sabor.disponible ? 'Sí' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-xl mb-4 text-cyan-800">Envases</h3>
                <table className="w-full">
                  <thead className="bg-cyan-50">
                    <tr>
                      <th className="p-2 text-left">Tipo</th>
                      <th className="p-2 text-right">Precio</th>
                      <th className="p-2 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventario.envases.map((envase) => (
                      <tr key={envase.tipo} className="border-b">
                        <td className="p-2">{envase.tipo}</td>
                        <td className="p-2 text-right">${envase.precio.toFixed(2)}</td>
                        <td className="p-2 text-right">{envase.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-xl mb-4 text-cyan-800">Toppings</h3>
                <table className="w-full">
                  <thead className="bg-cyan-50">
                    <tr>
                      <th className="p-2 text-left">Topping</th>
                      <th className="p-2 text-right">Precio</th>
                      <th className="p-2 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventario.toppings.map((topping) => (
                      <tr key={topping.nombre} className="border-b">
                        <td className="p-2">{topping.nombre}</td>
                        <td className="p-2 text-right">${topping.precio.toFixed(2)}</td>
                        <td className="p-2 text-right">{topping.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Vista Historial */}
        {vista === 'historial' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-xl mb-4 text-cyan-800">Historial de Pedidos</h3>
            {historialPedidos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay pedidos registrados</p>
            ) : (
              <div className="space-y-3">
                {historialPedidos.reverse().map((pedido) => (
                  <div key={pedido.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-cyan-800">Pedido #{pedido.id}</span>
                      <span className="text-sm text-gray-600">{pedido.fecha}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Sabor:</strong> {pedido.sabor}</div>
                      <div><strong>Envase:</strong> {pedido.envase}</div>
                      <div><strong>Cantidad:</strong> {pedido.cantidad}</div>
                      <div><strong>Total:</strong> ${pedido.total}</div>
                      {pedido.toppings.length > 0 && (
                        <div className="col-span-2"><strong>Toppings:</strong> {pedido.toppings.join(', ')}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {historialPedidos.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between text-xl font-bold text-cyan-800">
                  <span>Total de ventas:</span>
                  <span>${historialPedidos.reduce((sum, p) => sum + parseFloat(p.total), 0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeladeriaApp;