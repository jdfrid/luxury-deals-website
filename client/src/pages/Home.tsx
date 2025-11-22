import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Sparkles, TrendingDown, ExternalLink, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Deal {
  id: number;
  title: string;
  description: string;
  original_price: number;
  final_price: number;
  discount_percentage: number;
  category: string;
  deal_type: string;
  product_url: string;
  brand: string;
  condition: string;
  featured: boolean;
  image_url?: string;
}

export default function Home() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(true);

  // Load deals from JSON
  useEffect(() => {
    fetch('/real_ebay_deals.json')
      .then(res => res.json())
      .then(data => {
        setDeals(data);
        setFilteredDeals(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading deals:', err);
        setLoading(false);
      });
  }, []);

  // Filter and sort deals
  useEffect(() => {
    let filtered = deals;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(deal => deal.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort deals
    const sorted = [...filtered];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.final_price - b.final_price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.final_price - a.final_price);
        break;
      case "discount":
        sorted.sort((a, b) => b.discount_percentage - a.discount_percentage);
        break;
      case "featured":
      default:
        sorted.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.discount_percentage - a.discount_percentage;
        });
    }

    setFilteredDeals(sorted);
  }, [searchTerm, selectedCategory, sortBy, deals]);

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(deals.map(d => d.category)))];

  // Calculate stats
  const totalSavings = deals.reduce((sum, deal) => sum + (deal.original_price - deal.final_price), 0);
  const avgDiscount = deals.length > 0 ? deals.reduce((sum, deal) => sum + deal.discount_percentage, 0) / deals.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-purple-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-amber-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                Luxury Deals Store
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#deals" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Deals</a>
              <Link href="/categories">
                <a className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer">Categories</a>
              </Link>
              <a href="#about" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">About</a>
            </nav>

          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-amber-500/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-amber-500 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            {deals.length}+ Exclusive Luxury Deals
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Discover Premium
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 bg-clip-text text-transparent">
              Luxury Deals
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Save up to {avgDiscount.toFixed(0)}% on authentic luxury items from top brands. Curated deals on watches, fashion, jewelry, electronics, and more.
          </p>


          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <Card className="border-purple-100 shadow-md hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
                  ${totalSavings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Savings</div>
              </CardContent>
            </Card>
            <Card className="border-purple-100 shadow-md hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
                  {avgDiscount.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Average Discount</div>
              </CardContent>
            </Card>
            <Card className="border-purple-100 shadow-md hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
                  {deals.length}+
                </div>
                <div className="text-sm text-gray-600 mt-1">Premium Items</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section id="deals" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search luxury items, brands..."
                className="pl-10 h-12 border-purple-200 focus:border-purple-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[220px] h-12 border-purple-200">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="discount">Highest Discount</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={selectedCategory === category 
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white" 
                  : "border-purple-200 hover:border-purple-400"}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Deals Grid */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              All Luxury Deals
            </h3>
            <p className="text-gray-600">{filteredDeals.length} premium items with massive savings</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading premium deals...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeals.map(deal => (
                <Card key={deal.id} className="group overflow-hidden border-purple-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-64 bg-gradient-to-br from-purple-100 to-amber-50 flex items-center justify-center overflow-hidden">
                    {deal.image_url ? (
                      <img 
                        src={deal.image_url} 
                        alt={deal.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-amber-50 ${deal.image_url ? 'hidden' : ''}`}>
                      <div className="text-center p-6">
                        <div className="text-4xl font-bold text-purple-600 mb-2">{deal.brand}</div>
                        <div className="text-sm text-gray-600">{deal.condition}</div>
                      </div>
                    </div>
                    {deal.featured && (
                      <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {deal.discount_percentage > 0 && (
                      <Badge className="absolute top-3 right-3 bg-red-600 text-white text-lg font-bold border-0">
                        -{deal.discount_percentage.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="outline" className="mb-2 border-purple-200 text-purple-700">
                      {deal.category}
                    </Badge>
                    <h4 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {deal.title}
                    </h4>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-purple-600">
                        ${deal.final_price.toLocaleString()}
                      </span>
                      {deal.original_price > deal.final_price && (
                        <span className="text-sm text-gray-400 line-through">
                          ${deal.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {deal.original_price > deal.final_price && (
                      <div className="flex items-center gap-1 text-green-600 text-sm mb-4">
                        <TrendingDown className="w-4 h-4" />
                        <span className="font-semibold">
                          Save ${(deal.original_price - deal.final_price).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <a
                      href={deal.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on eBay
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredDeals.length === 0 && !loading && (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No deals found matching your criteria.</p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-purple-900 to-purple-800 text-white py-12 px-4 mt-20">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold">Luxury Deals Store</h3>
          </div>
          <p className="text-purple-200 mb-6">
            Your trusted source for authentic luxury items at unbeatable prices
          </p>
          <p className="text-sm text-purple-300">
            © 2024 Luxury Deals Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
