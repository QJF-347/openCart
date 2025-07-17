import React from 'react';

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateItemTotal = (item) => {
    return item.price * item.quantity;
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Shopping Cart</h2>
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-2">Your cart is empty</div>
          <div className="text-gray-400">Add some products to get started!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
        <button
          onClick={onClearCart}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item._id} className="flex items-center space-x-4 p-4 border rounded-lg">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-md"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
              }}
            />
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-500">Category:</span>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold text-green-600 mb-1">
                {formatPrice(item.price)}
              </div>
              <div className="text-sm text-gray-500">
                Stock: {item.stock}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onUpdateQuantity(item._id, Math.max(0, item.quantity - 1))}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800"
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800"
                disabled={item.quantity >= item.stock}
              >
                +
              </button>
            </div>

            <div className="text-right min-w-[100px]">
              <div className="font-bold text-lg text-green-600">
                {formatPrice(calculateItemTotal(item))}
              </div>
            </div>

            <button
              onClick={() => onRemoveItem(item._id)}
              className="text-red-600 hover:text-red-800 p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t">
        <div className="flex justify-between items-center">
          <span className="text-xl font-semibold text-gray-800">Total:</span>
          <span className="text-2xl font-bold text-green-600">
            {formatPrice(calculateTotal())}
          </span>
        </div>
        
        <button className="w-full mt-4 bg-green-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-green-700 transition-colors duration-200">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart; 