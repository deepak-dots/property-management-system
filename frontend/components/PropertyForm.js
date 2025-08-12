import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form'; 
import axios from '../utils/axiosInstance';
import { useRouter } from 'next/router';
import ActionDropdown from './ActionDropdown';

const baseURL = 'http://localhost:5000/uploads/';

const PropertyForm = ({ initialData = {}, isEdit = false, onSuccess }) => {
  const router = useRouter();
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);  

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      bhkType: '',
      furnishing: '',
      bedrooms: '',
      bathrooms: '',
      superBuiltupArea: '',
      developer: '',
      project: '',
      transactionType: '',
      status: '',
      price: '',
      reraId: '',
      address: '',
      description: '',
      city: '',
      isActive: true,
      images: [],
    },
  });


  useEffect(() => {
    if (isEdit && initialData && initialData._id) {
      setValue('title', initialData.title || '');
      setValue('bhkType', initialData.bhkType || '');
      setValue('furnishing', initialData.furnishing || '');
      setValue('bedrooms', initialData.bedrooms || '');
      setValue('bathrooms', initialData.bathrooms || '');
      setValue('superBuiltupArea', initialData.superBuiltupArea || '');
      setValue('developer', initialData.developer || '');
      setValue('project', initialData.project || '');
      setValue('transactionType', initialData.transactionType || '');
      setValue('status', initialData.status || '');
      setValue('price', initialData.price || '');
      setValue('reraId', initialData.reraId || '');
      setValue('address', initialData.address || '');
      setValue('description', initialData.description || '');
      setValue('city', initialData.city || '');
      setValue('isActive', initialData.activeStatus === 'Active');

      setExistingImages(
        (initialData.images || []).map((img) =>
          typeof img === 'string' ? img : img.url || img.path || ''
        )
      );
      setRemovedImages([]);
    }
  }, [initialData, isEdit, setValue]);

  // We keep local images in state for preview & removal
  const [newImages, setNewImages] = useState([]);

  // Handle file input change
  const onImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  };

  // Remove existing image
  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => {
      const removed = prev[index];
      setRemovedImages((prevRemoved) => [...prevRemoved, removed]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Remove newly uploaded image
  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  // On form submit handler
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append all fields except images
      for (const key in data) {
        if (key === 'images' || key === 'isActive') continue; // We'll handle images separately
        formData.append(key, data[key]);
      }

      // Append isActive as activeStatus string
      formData.append('activeStatus', data.isActive ? 'Active' : 'Draft');

      // Append new images files
      newImages.forEach(file => formData.append('images', file));


      // Append existing images URLs
      formData.append('existingImages', JSON.stringify(existingImages));

      // Append removed images URLs
      formData.append('removedImages', JSON.stringify(removedImages)); 

      if (isEdit && initialData._id) {
        await axios.put(`/properties/${initialData._id}`, formData);
        alert('Property updated!');
      } else {
        await axios.post('/properties', formData);
        alert('Property created!');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      alert('Something went wrong.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded-lg space-y-4">
       {isEdit && initialData._id && <ActionDropdown propertyId={initialData._id} hideEdit={true} />}

      <h2 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Property' : 'Add Property'}</h2>

      {/* react-hook-form's handleSubmit handles validation */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        noValidate
      >
        {/* Property Name */}
        <div className="flex flex-col">
          <label htmlFor="title" className="mb-1 font-medium">
            Property Name
          </label>
          <input
            id="title"
            name="title"
            placeholder="Property name"
            {...register('title', { required: 'Property name is required' })}
            className={`py-2 px-3 border rounded ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <span className="text-red-500 text-sm mt-1">{errors.title.message}</span>
          )}
        </div>

        {/* Developer */}
        <div className="flex flex-col">
          <label htmlFor="developer" className="mb-1 font-medium">
            Developer
          </label>
          <input
            id="developer"
            name="developer"
            placeholder="Developer"
            {...register('developer', { required: 'Developer is required' })}
            className={`py-2 px-3 border rounded ${
              errors.developer ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.developer && (
            <span className="text-red-500 text-sm mt-1">{errors.developer.message}</span>
          )}
        </div>

        {/* Project */}
        <div className="flex flex-col">
          <label htmlFor="project" className="mb-1 font-medium">
            Project
          </label>
          <input
            id="project"
            name="project"
            placeholder="Project"
            {...register('project', { required: 'Project is required' })}
            className={`py-2 px-3 border rounded ${
              errors.project ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.project && (
            <span className="text-red-500 text-sm mt-1">{errors.project.message}</span>
          )}
        </div>

        {/* BHK Type */}
        <div className="flex flex-col">
          <label htmlFor="bhkType" className="mb-1 font-medium">
            BHK Type
          </label>
          <select
            id="bhkType"
            name="bhkType"
            {...register('bhkType', { required: 'BHK Type is required' })}
            className={`py-2 px-3 border rounded ${
              errors.bhkType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select BHK</option>
            <option>1 BHK</option>
            <option>2 BHK</option>
            <option>3 BHK</option>
            <option>4 BHK</option>
          </select>
          {errors.bhkType && (
            <span className="text-red-500 text-sm mt-1">{errors.bhkType.message}</span>
          )}
        </div>

        {/* Furnishing */}
        <div className="flex flex-col">
          <label htmlFor="furnishing" className="mb-1 font-medium">
            Furnishing
          </label>
          <select
            id="furnishing"
            name="furnishing"
            {...register('furnishing', { required: 'Furnishing is required' })}
            className={`py-2 px-3 border rounded ${
              errors.furnishing ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Furnishing</option>
            <option>Furnished</option>
            <option>Semi-Furnished</option>
            <option>Unfurnished</option>
          </select>
          {errors.furnishing && (
            <span className="text-red-500 text-sm mt-1">{errors.furnishing.message}</span>
          )}
        </div>

        {/* Bedrooms */}
        <div className="flex flex-col">
          <label htmlFor="bedrooms" className="mb-1 font-medium">
            Bedrooms
          </label>
          <input
            id="bedrooms"
            type="number"
            name="bedrooms"
            placeholder="Bedrooms"
            {...register('bedrooms', {
              required: 'Bedrooms is required',
              min: { value: 0, message: 'Cannot be negative' },
            })}
            className={`py-2 px-3 border rounded ${
              errors.bedrooms ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.bedrooms && (
            <span className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</span>
          )}
        </div>

        {/* Bathrooms */}
        <div className="flex flex-col">
          <label htmlFor="bathrooms" className="mb-1 font-medium">
            Bathrooms
          </label>
          <input
            id="bathrooms"
            type="number"
            name="bathrooms"
            placeholder="Bathrooms"
            {...register('bathrooms', {
              required: 'Bathrooms is required',
              min: { value: 0, message: 'Cannot be negative' },
            })}
            className={`py-2 px-3 border rounded ${
              errors.bathrooms ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.bathrooms && (
            <span className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</span>
          )}
        </div>

        {/* Super Builtup Area */}
        <div className="flex flex-col">
          <label htmlFor="superBuiltupArea" className="mb-1 font-medium">
            Super Built Up Area
          </label>
          <input
            id="superBuiltupArea"
            name="superBuiltupArea"
            placeholder="e.g. 1200 sqft"
            {...register('superBuiltupArea', { required: 'Area is required' })}
            className={`py-2 px-3 border rounded ${
              errors.superBuiltupArea ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.superBuiltupArea && (
            <span className="text-red-500 text-sm mt-1">{errors.superBuiltupArea.message}</span>
          )}
        </div>

        {/* Transaction Type */}
        <div className="flex flex-col">
          <label htmlFor="transactionType" className="mb-1 font-medium">
            Transaction Type
          </label>
          <select
            id="transactionType"
            name="transactionType"
            {...register('transactionType', { required: 'Transaction Type is required' })}
            className={`py-2 px-3 border rounded ${
              errors.transactionType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Transaction Type</option>
            <option>New</option>
            <option>Resale</option>
          </select>
          {errors.transactionType && (
            <span className="text-red-500 text-sm mt-1">{errors.transactionType.message}</span>
          )}
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label htmlFor="status" className="mb-1 font-medium">
            Property Status
          </label>
          <select
            id="status"
            name="status"
            {...register('status', { required: 'Status is required' })}
            className={`py-2 px-3 border rounded ${
              errors.status ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select status</option>
            <option>Ready to Move</option>
            <option>Under Construction</option>
          </select>
          {errors.status && (
            <span className="text-red-500 text-sm mt-1">{errors.status.message}</span>
          )}
        </div>

        {/* Price */}
        <div className="flex flex-col">
          <label htmlFor="price" className="mb-1 font-medium">
            Price
          </label>
          <input
            id="price"
            type="number"
            name="price"
            placeholder="Price"
            {...register('price', {
              required: 'Price is required',
              min: { value: 0, message: 'Price cannot be negative' },
            })}
            className={`py-2 px-3 border rounded ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.price && (
            <span className="text-red-500 text-sm mt-1">{errors.price.message}</span>
          )}
        </div>

        {/* RERA ID */}
        <div className="flex flex-col">
          <label htmlFor="reraId" className="mb-1 font-medium">
            RERA ID
          </label>
          <input
            id="reraId"
            name="reraId"
            placeholder="RERA ID"
            {...register('reraId')}
            className="py-2 px-3 border rounded border-gray-300"
          />
        </div>

        {/* Address */}
        <div className="flex flex-col">
          <label htmlFor="address" className="mb-1 font-medium">
            Address
          </label>
          <input
            id="address"
            name="address"
            placeholder="Address"
            {...register('address', { required: 'Address is required' })}
            className={`py-2 px-3 border rounded ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.address && (
            <span className="text-red-500 text-sm mt-1">{errors.address.message}</span>
          )}
        </div>

        {/* City */}
        <div className="flex flex-col">
          <label htmlFor="city" className="mb-1 font-medium">
            City
          </label>
          <input
            id="city"
            name="city"
            placeholder="City"
            {...register('city', { required: 'City is required' })}
            className={`py-2 px-3 border rounded ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.city && (
            <span className="text-red-500 text-sm mt-1">{errors.city.message}</span>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col col-span-1 md:col-span-2">
          <label htmlFor="description" className="mb-1 font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Description"
            {...register('description', { required: 'Description is required' })}
            className={`py-2 px-3 border rounded h-24 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <span className="text-red-500 text-sm mt-1">{errors.description.message}</span>
          )}
        </div>

        {/* Active Checkbox */}
        {/* <div className="flex flex-col col-span-1 md:col-span-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="mr-2"
              defaultChecked={false}
            />
            <span className="font-medium">Active</span>
          </label>
        </div> */}

        {/* Images */}
        <div className="flex flex-col col-span-1 md:col-span-2">
          <label htmlFor="images" className="mb-1 font-medium">
            Images
          </label>
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            onChange={onImageChange}
            multiple
          />

          {/* Display existing images */}
          <div className="mt-2 flex flex-wrap gap-4">
            {existingImages.map((url, index) => {
              const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
              return (
                <div
                  key={`existing-${index}`}
                  className="relative w-24 h-24 border rounded overflow-hidden"
                >
                  <img
                    src={fullUrl}
                    alt={`Existing image ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                    aria-label="Remove existing image"
                  >
                    &times;
                  </button>
                </div>
              );
            })}

            {/* Display newly uploaded images */}
            {newImages.map((file, index) => {
              const url = URL.createObjectURL(file);
              return (
                <div
                  key={`new-${index}`}
                  className="relative w-24 h-24 border rounded overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`New upload ${index + 1}`}
                    className="object-cover w-full h-full"
                    onLoad={() => URL.revokeObjectURL(url)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                    aria-label="Remove new image"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="col-span-1 md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded text-lg font-semibold"
        >
          {isEdit ? 'Update Property' : 'Create Property'}
        </button>
      </form>

      {isEdit && initialData._id && <ActionDropdown propertyId={initialData._id} hideEdit={true} />}
    </div>
  );
};

export default PropertyForm;
