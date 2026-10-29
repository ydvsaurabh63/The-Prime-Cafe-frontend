// Smart Food & Beverage Fallback Image Resolver
// Ensures no card or menu item ever shows a missing image or blank box

export const getItemFallbackImage = (item) => {
  const name = (typeof item === 'string' ? item : item?.name || '').toLowerCase();
  const cat = (item?.categorySlug || item?.category?.slug || item?.category?.name || '').toLowerCase();

  if (name.includes('almond') && name.includes('coffee')) {
    return 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('coffee') || name.includes('cappuccino') || name.includes('latte') || name.includes('espresso') || name.includes('mocha') || name.includes('brew')) {
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('tea') || name.includes('chai')) {
    return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('burger')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('noodle') || name.includes('chowmein') || name.includes('maggi') || name.includes('pasta')) {
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('roll')) {
    return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('rice') || name.includes('fried rice') || name.includes('biryani')) {
    return 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('momos') || name.includes('dimsum')) {
    return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('shake') || name.includes('mojito') || name.includes('drink') || name.includes('lassi') || name.includes('water')) {
    return 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('sandwich') || name.includes('maska') || name.includes('bhatura') || name.includes('toast') || name.includes('dahi')) {
    return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('egg') || name.includes('aamlet') || name.includes('omelette')) {
    return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('paratha') || name.includes('roti') || name.includes('bread')) {
    return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80';
  }
  if (cat.includes('chinees')) {
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80';
  }
  if (cat.includes('tea') || cat.includes('coffee') || cat.includes('drink')) {
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80';
  }

  // Universal cozy cafe fallback
  return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80';
};
