import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostForm, { INITIAL_VALUES } from '../components/post/PostForm.jsx';
import PostCard from '../components/post/PostCard.jsx';
import { POST_STATUS, ITEM_CATEGORIES } from '../utils/constants.js';
import { postService } from '../services/postService.js';
import uploadService from '../services/uploadService.js';
import categoryService from '../services/categoryService.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useToast } from '../context/ToastContext.jsx';

export default function CreatePost() {
  useDocumentTitle('Đăng bài mới');
  const navigate = useNavigate();
  const toast = useToast();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [categoryMap, setCategoryMap] = useState({});

  useEffect(() => {
    categoryService
      .getAll()
      .then((list) => {
        const map = {};
        (list || []).forEach((item) => {
          map[item.name] = item.id;
        });
        setCategoryMap(map);
      })
      .catch(() => {
        toast.error('Không tải được danh mục. Vui lòng tải lại trang.');
      });
  }, [toast]);

  const categoryOptions = useMemo(() => {
    const names = Object.keys(categoryMap);
    return names.length > 0 ? names : ITEM_CATEGORIES;
  }, [categoryMap]);

  const previewPost = {
    id: 'preview',
    type: values.type,
    title: values.title || 'Tiêu đề bài đăng',
    description: values.description,
    location: values.location,
    date: values.date,
    status: POST_STATUS.SEARCHING,
    images: values.images.length
      ? [{ image_url: URL.createObjectURL(values.images[0]) }]
      : [],
  };

  const handleSubmit = async (data) => {
    setSubmitError('');
    setLoading(true);
    try {
      const imageUrls = await uploadService.uploadImages(data.images);

      const categoryId = data.category ? categoryMap[data.category] : null;
      if (data.category && !categoryId) {
        throw new Error('Danh mục không hợp lệ. Vui lòng chọn lại hoặc chạy npm run db:seed.');
      }

      const payload = {
        post_type: data.type,
        title: data.title.trim(),
        category_id: categoryId,
        description: data.description.trim(),
        incident_date: data.date,
        location: data.specific_location.trim()
          ? `${data.location} - ${data.specific_location.trim()}`
          : data.location,
        image_urls: imageUrls,
      };

      const created = await postService.createPost(payload);
      const id = created?.data?.id || created?.id;
      toast.success('Đăng bài thành công');
      navigate(id ? `/posts/${id}` : '/', { replace: true });
    } catch (err) {
      const msg = err?.message || 'Đăng bài thất bại. Vui lòng thử lại.';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Đăng bài mới</h1>
        <p className="text-sm text-gray-500 mt-1">
          Điền thông tin chi tiết để tăng khả năng tìm lại đồ.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <PostForm
            values={values}
            onChange={setValues}
            onSubmit={handleSubmit}
            loading={loading}
            categories={categoryOptions}
          />
          {submitError && (
            <p className="mt-4 text-xs text-status-lost bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}
        </div>

        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-20 space-y-3">
            <h2 className="text-sm font-medium text-gray-700">Xem trước</h2>
            {values.type ? (
              <PostCard post={previewPost} />
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-500">
                Chọn loại bài đăng để xem trước
              </div>
            )}
            <p className="text-xs text-gray-500">
              Đây là cách bài đăng của bạn sẽ hiển thị trên trang chủ.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
