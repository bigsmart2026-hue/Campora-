import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createProduct, updateProduct } from '@/services/productService';
import { uploadProductImagesToFirestore } from '@/utils/imageStorage';
import { getCategories } from '@/services/categoryService';
import { Category } from '@/types';
import toast from 'react-hot-toast';

const productSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z
    .number()
    .min(100, 'Price must be at least ₦100')
    .max(100000000, 'Price is too high'),
  originalPrice: z.number().optional(),
  category: z.string().min(1, 'Please select a category'),
  condition: z.enum(['new', 'like_new', 'good', 'fair'], {
    errorMap: () => ({ message: 'Please select a condition' }),
  }),
});

type ProductFormData = z.infer<typeof productSchema>;

const CONDITIONS = [
  { value: 'new', label: 'New', description: 'Brand new, unused' },
  { value: 'like_new', label: 'Like New', description: 'Barely used, like new condition' },
  { value: 'good', label: 'Good', description: 'Minor signs of use' },
  { value: 'fair', label: 'Fair', description: 'Noticeable wear but works fine' },
];

export default function CreateProduct() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      condition: 'good',
    },
  });

  useEffect(() => {
    async function loadCategories() {
      const cats = await getCategories();
      setCategories(cats);
    }
    loadCategories();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }

    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, (e.target?.result as string) || '']);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!user) {
      toast.error('Please login to create a product');
      return;
    }

    if (!user.isCampusVerified) {
      toast.error('Please verify your campus first');
      return;
    }

    if (images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create product first to get ID
      const productId = await createProduct({
        sellerId: user.id,
        title: data.title,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        category: data.category,
        condition: data.condition,
        images: [],
        campus: user.campus || '',
        status: 'active',
        isInspected: false,
      });

      // Upload images
      const imageUrls = await uploadProductImagesToFirestore(images, productId);

      // Update product with image URLs
      await updateProduct(productId, { images: imageUrls });

      toast.success('Product created successfully!');
      navigate(`/products/${productId}`);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          List a Product
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Images */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Photos
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add up to 6 photos. First photo will be the cover.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-600 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-500"
                  >
                    <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              ))}

              {images.length < 6 && (
                <label className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="label">
                  Title
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="input-field"
                  placeholder="What are you selling?"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="label">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="input-field"
                  placeholder="Describe your item in detail..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Category & Condition */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Category & Condition
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="label">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="input-field"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Condition</label>
                <div className="grid grid-cols-2 gap-3">
                  {CONDITIONS.map((condition) => (
                    <label
                      key={condition.value}
                      className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <input
                        type="radio"
                        {...register('condition')}
                        value={condition.value}
                        className="mt-0.5 w-4 h-4 text-primary-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {condition.label}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {condition.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.condition.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pricing
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="price" className="label">
                  Price (₦)
                </label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  className="input-field"
                  placeholder="0"
                  min="100"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="originalPrice" className="label">
                  Original Price (₦) - Optional
                </label>
                <input
                  {...register('originalPrice', { valueAsNumber: true })}
                  type="number"
                  className="input-field"
                  placeholder="0"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Show buyers how much they're saving
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 btn-secondary py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary py-3"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                'List Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
