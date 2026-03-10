import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';

const InputField = ({ type, placeholder, name, handleChange, address }) => (
    <input
        className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-purple-600 transition'
        type={type}
        placeholder={placeholder}
        onChange={handleChange}
        name={name}
        value={address[name]}
        required
    />
);

const AddAddress = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();

    const [address, setAddress] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress((prevAddress) => ({
            ...prevAddress,
            [name]: value,
        }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!profile) {
            toast.error('Please login to add an address');
            return;
        }
        try {
            const data = await api.createAddress(address);
            if (data.success) {
                toast.success('Address added successfully!');
                // Store flag in sessionStorage to trigger refresh
                sessionStorage.setItem('addressAdded', 'true');
                // Navigate back to cart
                setTimeout(() => {
                    navigate('/cart');
                }, 300);
            } else {
                toast.error(data.message || 'Failed to add address');
            }
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to save address');
        }
    };

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Please login to add an address</p>
            </div>
        );
    }

    return (
        <div className='max-w-4xl mx-auto mt-16 pb-16 px-4'>
            <p className='text-2xl md:text-3xl text-gray-500 text-center'>
                Add Shipping <span className='font-semibold text-purple-600'>Address</span>
            </p>
            <div className='flex flex-col md:flex-row items-center justify-center mt-10 gap-8'>
                <div className='w-full max-w-md'>
                    <form onSubmit={onSubmitHandler} className='space-y-4 mt-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} name='firstName' type="text" placeholder="First Name" />
                            <InputField handleChange={handleChange} address={address} name='lastName' type="text" placeholder="Last Name" />
                        </div>

                        <InputField handleChange={handleChange} address={address} name='email' type="email" placeholder="Email ID" />

                        <InputField handleChange={handleChange} address={address} name='street' type="text" placeholder="Street Address" />

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} name='city' type="text" placeholder="City" />
                            <InputField handleChange={handleChange} address={address} name='state' type="text" placeholder="State" />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} name='zipCode' type="text" placeholder="Zip Code" />
                            <InputField handleChange={handleChange} address={address} name='country' type="text" placeholder="Country" />
                        </div>

                        <InputField handleChange={handleChange} address={address} name='phone' type="tel" placeholder="Phone Number" />

                        <div className="flex gap-3">
                            <button 
                                type='button' 
                                onClick={() => navigate('/cart')}
                                className='flex-1 mt-6 bg-gray-300 text-gray-700 py-3 hover:bg-gray-400 transition cursor-pointer uppercase font-medium'
                            >
                                Cancel
                            </button>
                            <button 
                                type='submit' 
                                className='flex-1 mt-6 bg-purple-600 text-white py-3 hover:bg-purple-700 transition cursor-pointer uppercase font-medium'
                            >
                                Save Address
                            </button>
                        </div>
                    </form>
                </div>
                <img
                    className='w-80 h-80 object-cover rounded-lg shadow-lg'
                    src='https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg'
                    alt="Add Address"
                />
            </div>
        </div>
    );
};

export default AddAddress;
