import React from "react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="bg-white shadow rounded-lg p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">Bienvenido de nuevo 👋</p>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold text-gray-700">Usuarios</h2>
          <p className="text-3xl font-bold text-indigo-600 mt-2">124</p>
          <p className="text-sm text-gray-500 mt-1">Activos este mes</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold text-gray-700">Ventas</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">$8,230</p>
          <p className="text-sm text-gray-500 mt-1">Últimos 7 días</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold text-gray-700">Tareas</h2>
          <p className="text-3xl font-bold text-yellow-500 mt-2">15</p>
          <p className="text-sm text-gray-500 mt-1">Pendientes</p>
        </div>
      </div>

      {/* Tabla de ejemplo */}
      <div className="bg-white rounded-lg shadow mt-6 p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Últimos registros</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Nombre</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-4 py-2 text-sm text-gray-700">#001</td>
              <td className="px-4 py-2 text-sm text-gray-700">Juan Pérez</td>
              <td className="px-4 py-2 text-sm text-green-600 font-semibold">Activo</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm text-gray-700">#002</td>
              <td className="px-4 py-2 text-sm text-gray-700">María López</td>
              <td className="px-4 py-2 text-sm text-yellow-500 font-semibold">Pendiente</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm text-gray-700">#003</td>
              <td className="px-4 py-2 text-sm text-gray-700">Pedro Gómez</td>
              <td className="px-4 py-2 text-sm text-red-500 font-semibold">Inactivo</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
