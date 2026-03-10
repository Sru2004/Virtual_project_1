import React, { useState } from 'react';
import { adminApi } from '../../lib/adminApi';
import { toast } from 'react-hot-toast';

const TransactionsSection = ({ orders, onOrdersUpdated }) => {
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const handleDeliveryStatusChange = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      const response = await adminApi.updateDeliveryStatus(orderId, newStatus);
      if (response.success) {
        toast.success(`Order delivery status updated to ${newStatus}`);
        // Refresh orders if callback provided
        if (onOrdersUpdated) {
          onOrdersUpdated();
        }
      } else {
        toast.error(response.message || 'Failed to update delivery status');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Failed to update delivery status');
    } finally {
      setUpdatingOrder(null);
    }
  };
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Transaction Management</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const orderId = order._id || order.id;
                const user = order.user_id;
                const userLabel = typeof user === 'object'
                  ? (user.full_name || user.email || user._id)
                  : user;
                return (
                  <tr key={orderId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {orderId ? `${orderId.slice(0, 8)}...` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userLabel ? `User ${userLabel.toString().slice(0, 8)}...` : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{Number(order.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.payment_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.delivery_status || 'pending'}
                        onChange={(e) => handleDeliveryStatusChange(orderId, e.target.value)}
                        disabled={updatingOrder === orderId}
                        className={`text-xs rounded-lg border-0 font-medium ${
                          order.delivery_status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.delivery_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        } ${updatingOrder === orderId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.order_date || order.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-2">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsSection;
