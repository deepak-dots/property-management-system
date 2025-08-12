import { useRouter } from 'next/router';

export default function PropertyCard({ property }) {
  const router = useRouter();

  // Compose image URL helper
  const getImageUrl = (img) =>
    img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`;

  return (
    <div 
      className="h-full-properties-card border rounded-lg overflow-hidden shadow-md group cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={() => router.push(`/properties/${property._id}`)}
    >
      <div className="relative">
        {property.images && property.images.length > 0 ? (
          <img
            src={getImageUrl(property.images[0])}
            alt={property.title}
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="h-56 w-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center">
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent parent onClick
              router.push(`/properties/${property._id}`);
            }}
            className="bg-white text-black font-medium py-2 px-4 rounded hover:bg-gray-200"
          >
            View Details
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{property.title}</h3>

        {/* Show BHK Type instead of category */}
        {property.bhkType && (
          <p className="text-sm text-gray-600 mb-1">
            <strong>{property.bhkType}</strong>
          </p>
        )}

        {/* Show price */}
        {property.price && (
          <p className="text-green-600 font-bold">
            ₹ {Number(property.price).toLocaleString()}
          </p>
        )}

        {/* Show city and address */}
        {(property.city || property.address) && (
          <p className="text-sm text-gray-600">
            {[property.address, property.city].filter(Boolean).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
