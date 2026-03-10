import React, { useEffect, useState } from 'react';
import { getImageUrl } from '../../lib/imageUtils';

const ArtistOrdersTab = ({ orders }) => {
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [localOrders, setLocalOrders] = useState([]);

  useEffect(() => {
    setLocalOrders(Array.isArray(orders) ? orders : []);
  }, [orders]);

  const handleToggle = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    const parts = [
      address.street,
      address.city,
      address.state,
      address.country,
      address.zip
    ].filter(Boolean);
    return parts.length ? parts.join(', ') : 'N/A';
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Order History</h3>
      {localOrders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {localOrders.map((order) => {
            const orderId = order._id || order.id;
            const artwork = order?.artwork_id || order?.items?.[0]?.product;
            const buyer = order?.user_id;
            const quantity = order?.quantity || order?.items?.[0]?.quantity || 1;
            const totalAmount = order?.total_amount || order?.amount || (artwork?.price || 0) * quantity;
            const paymentMethod = order?.payment_type || order?.paymentType || 'Online';
            const orderDate = order?.order_date || order?.created_at || order?.createdAt || Date.now();
            const isExpanded = expandedOrderId === orderId;

            return (
              <div
                key={orderId}
                className="p-4 border rounded-lg cursor-pointer"
                onClick={() => handleToggle(orderId)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <img
                      src={getImageUrl(artwork?.image_url) || 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg'}
                      alt={artwork?.title || 'Artwork'}
                      className="w-12 h-12 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg';
                      }}
                    />
                    <div>
                      <p className="font-medium">{artwork?.title || 'Artwork'}</p>
                      <p className="text-sm text-gray-600">Order ID: {orderId}</p>
                      <p className="text-xs text-gray-500">
                        Quantity: {quantity} • Order Date: {new Date(orderDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-700 font-medium mt-1">
                        Payment Method: <span className="text-amber-600">{paymentMethod === 'Online' ? '💳 Online' : '💵 COD'}</span>
                      </p>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Buyer Details:</p>
                        <p className="text-xs text-gray-600">Name: {buyer?.full_name || 'N/A'}</p>
                        <p className="text-xs text-gray-600">Email: {buyer?.email || 'N/A'}</p>
                        {buyer?.phone && (
                          <p className="text-xs text-gray-600">Phone: {buyer.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{Number(totalAmount || 0).toFixed(2)}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Buyer Details</h4>
                        <p className="text-sm text-gray-600">Name: {buyer?.full_name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Email: {buyer?.email || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Phone: {buyer?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Shipping Address</h4>
                        <p className="text-sm text-gray-600">{formatAddress(order?.shipping_address)}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Payment Method</h4>
                      <p className="text-sm text-amber-600 font-semibold">
                        {paymentMethod === 'Online' ? '💳 Online Payment (UPI/Card)' : '💵 Cash on Delivery (COD)'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ArtistOrdersTab;
