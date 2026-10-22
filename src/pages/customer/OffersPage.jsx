import React, { useEffect, useState } from 'react';
import { Tag, Sparkles, Copy, Check, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const { applyCouponCode } = useCart();
  const [applyMessage, setApplyMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/offers');
        if (res.data.success) {
          setOffers(res.data.data);
        }
      } catch (err) {
        setError('Failed to load active offers. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const handleApplyOffer = async (code) => {
    const res = await applyCouponCode(code);
    setApplyMessage({
      text: res.message,
      isError: !res.success
    });
    setTimeout(() => setApplyMessage({ text: '', isError: false }), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4A2C18] to-[#2C1810] text-[#FAF7F2] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#C85A32] text-white mb-2">
            <Sparkles size={12} /> Seasonal Cafe Treats & Discounts
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Active Offers & Promo Codes</h2>
          <p className="text-xs sm:text-sm text-[#E6DCD3] mt-2 leading-relaxed">
            Apply valid coupon codes directly to your cart or copy them to enjoy discount savings on your dining experience!
          </p>
        </div>
      </div>

      {applyMessage.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between ${
            applyMessage.isError
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{applyMessage.text}</span>
          <Link to="/order" className="font-bold underline text-xs ml-2">
            Go to Cart →
          </Link>
        </div>
      )}

      {/* Offers Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 border-3 border-[#C85A32] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-[#7A685D]">Loading special cafe treats...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="p-12 text-center bg-[#F5EFEB] rounded-3xl border border-[#E6DCD3]">
          <Tag size={40} className="mx-auto text-[#7A685D] mb-2" />
          <h3 className="text-base font-bold text-[#2C1810]">No Active Offers</h3>
          <p className="text-xs text-[#7A685D] mt-1">Check back soon for fresh deals and discounts!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="bg-white rounded-3xl border border-[#E6DCD3] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {offer.image && (
                  <div className="h-44 w-full overflow-hidden relative">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#C85A32] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                      {offer.discountType === 'percentage'
                        ? `${offer.discountValue}% OFF`
                        : `₹${offer.discountValue} FLAT OFF`}
                    </div>
                  </div>
                )}

                <div className="p-5">
                  <h3 className="font-bold text-base text-[#2C1810]">{offer.title}</h3>
                  <p className="text-xs text-[#7A685D] mt-1.5 leading-relaxed">{offer.description}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[#7A685D]">
                    {offer.minimumOrderAmount > 0 && (
                      <span className="bg-[#FAF7F2] border border-[#E6DCD3] px-2.5 py-1 rounded-lg font-semibold">
                        Min Order: ₹{offer.minimumOrderAmount}
                      </span>
                    )}
                    {offer.endDate && (
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-[#C85A32]" />
                        Valid till {new Date(offer.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {offer.couponCode && (
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-[#F5EFEB] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 bg-[#FAF7F2] border border-dashed border-[#C85A32] rounded-xl px-3 py-1.5">
                      <span className="font-mono font-extrabold text-xs text-[#C85A32] tracking-wider">
                        {offer.couponCode}
                      </span>
                      <button
                        onClick={() => handleCopyCode(offer.couponCode)}
                        className="text-[#7A685D] hover:text-[#2C1810] transition p-0.5"
                        title="Copy code"
                      >
                        {copiedCode === offer.couponCode ? (
                          <Check size={14} className="text-emerald-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => handleApplyOffer(offer.couponCode)}
                      className="text-xs bg-[#4A2C18] hover:bg-[#2C1810] text-white font-bold px-4 py-2 rounded-xl transition shadow-xs"
                    >
                      Apply Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OffersPage;
