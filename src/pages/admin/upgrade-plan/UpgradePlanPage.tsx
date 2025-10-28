import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../../../context/DatabaseContext';
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  CreditCard, 
  MapPin, 
  Shield, 
  Star,
  Zap,
  Users,
  Database,
  Lock,
  Tag
} from 'lucide-react';

const UpgradePlanPage = () => {
  const { state } = useDatabase();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'TR'
  });

  // Filter only general plans (not custom plans)
  const availablePlans = state.pricingPlans.filter(plan => 
    plan.planType === 'general' && plan.isActive && plan.name.toLowerCase() !== 'ücretsiz'
  );

  const selectedPlanData = availablePlans.find(p => p.id === selectedPlan) || availablePlans[0];
  
  // Get campaign for selected plan
  const getCampaignForPlan = (planId: string) => {
    const plan = state.pricingPlans.find(p => p.id === planId);
    if (plan?.campaignId) {
      return state.campaigns.find(c => c.id === plan.campaignId && c.isActive);
    }
    return null;
  };

  // Enhanced price calculation with proper campaign handling
  const calculatePriceWithCampaign = (plan: any, cycle: 'monthly' | 'yearly') => {
    const campaign = getCampaignForPlan(plan.id);
    
    // Base price calculation
    let originalPrice = cycle === 'monthly' ? plan.price : (plan.yearlyPrice || plan.price * 10);
    
    if (!campaign) {
      return {
        originalPrice,
        finalPrice: originalPrice,
        discount: 0,
        hasDiscount: false,
        campaign: null
      };
    }

    // Check if campaign applies to this billing cycle
    const campaignApplies = campaign.applicableDuration === 'both' || 
                           campaign.applicableDuration === cycle;
    
    if (!campaignApplies) {
      return {
        originalPrice,
        finalPrice: originalPrice,
        discount: 0,
        hasDiscount: false,
        campaign: null
      };
    }

    let finalPrice = originalPrice;
    let discount = 0;

    // Apply campaign discount based on type and cycle
    if (campaign.discountType === 'free_trial') {
      // Free trial campaigns show as 0 for trial period
      finalPrice = 0;
      discount = originalPrice;
    } else if (campaign.discountType === 'percentage') {
      // Use cycle-specific discount if available
      let discountPercentage = campaign.discountValue;
      
      if (cycle === 'monthly' && campaign.monthlyDiscount) {
        discountPercentage = campaign.monthlyDiscount.value;
      } else if (cycle === 'yearly' && campaign.yearlyDiscount) {
        discountPercentage = campaign.yearlyDiscount.value;
      }
      
      discount = originalPrice * (discountPercentage / 100);
      finalPrice = originalPrice - discount;
    } else if (campaign.discountType === 'fixed') {
      // Use cycle-specific discount if available
      let discountAmount = campaign.discountValue;
      
      if (cycle === 'monthly' && campaign.monthlyDiscount) {
        discountAmount = campaign.monthlyDiscount.value;
      } else if (cycle === 'yearly' && campaign.yearlyDiscount) {
        discountAmount = campaign.yearlyDiscount.value;
      }
      
      discount = discountAmount;
      finalPrice = Math.max(0, originalPrice - discountAmount);
    }

    return {
      originalPrice,
      finalPrice: Math.round(finalPrice),
      discount: Math.round(discount),
      hasDiscount: discount > 0,
      campaign
    };
  };

  const currentPlanPricing = selectedPlanData ? calculatePriceWithCampaign(selectedPlanData, billingCycle) : null;

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      handleInputChange('cardNumber', formatted);
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    if (formatted.length <= 5) {
      handleInputChange('expiryDate', formatted);
    }
  };

  const handleCvvChange = (value: string) => {
    const v = value.replace(/[^0-9]/gi, '');
    if (v.length <= 3) {
      handleInputChange('cvv', v);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    const pricing = currentPlanPricing;
    const message = pricing?.hasDiscount 
      ? `${selectedPlanData?.name} planı için ${pricing.finalPrice} ${selectedPlanData?.currency} ödeme işlemi başlatıldı! (${pricing.discount} ${selectedPlanData?.currency} indirim uygulandı)`
      : `${selectedPlanData?.name} planı için ${pricing?.finalPrice} ${selectedPlanData?.currency} ödeme işlemi başlatıldı!`;
    
    alert(message + ' (Demo)');
    navigate('/dashboard');
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('premium')) return <Crown className="text-purple-600" size={24} />;
    if (name.includes('kurumsal') || name.includes('enterprise')) return <Star className="text-yellow-600" size={24} />;
    return <Database className="text-blue-600" size={24} />;
  };

  const getPlanColorClasses = (planId: string, isSelected: boolean) => {
    const plan = availablePlans.find(p => p.id === planId);
    const baseClasses = "relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg";
    
    if (isSelected) {
      const name = plan?.name.toLowerCase() || '';
      if (name.includes('premium')) return `${baseClasses} border-purple-500 bg-purple-50 shadow-lg`;
      if (name.includes('kurumsal') || name.includes('enterprise')) return `${baseClasses} border-yellow-500 bg-yellow-50 shadow-lg`;
      return `${baseClasses} border-blue-500 bg-blue-50 shadow-lg`;
    }
    
    return `${baseClasses} border-gray-200 bg-white hover:border-gray-300`;
  };

  const isPopularPlan = (planName: string) => {
    return planName.toLowerCase().includes('premium');
  };

  // Set default selected plan if none selected
  React.useEffect(() => {
    if (availablePlans.length > 0 && !selectedPlan) {
      setSelectedPlan(availablePlans[0].id);
    }
  }, [availablePlans, selectedPlan]);

  if (availablePlans.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Crown className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Henüz Plan Bulunmuyor</h2>
          <p className="text-gray-600 mb-4">Şu anda satın alınabilir plan bulunmamaktadır.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Dashboard'a Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <Crown className="text-purple-600" size={28} />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-800">Planınızı Yükseltin</h1>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">HZMSoft</span> DataBase Pro
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Current Plan Info */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Mevcut Planınız</h2>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900 capitalize">
                    {state.user?.subscriptionType === 'free' ? 'Ücretsiz' : state.user?.subscriptionType}
                  </span>
                  <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {state.user?.maxProjects === -1 ? 'Sınırsız' : state.user?.maxProjects} Proje
                  </span>
                  <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {state.user?.maxTables === -1 ? 'Sınırsız' : state.user?.maxTables} Tablo
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Kullanım</p>
                <p className="text-lg font-semibold">
                  {state.projects.length} / {state.user?.maxProjects === -1 ? '∞' : state.user?.maxProjects} Proje
                </p>
              </div>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="text-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Aylık
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yıllık
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                  %17 İndirim
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {availablePlans.map((plan) => {
              const pricing = calculatePriceWithCampaign(plan, billingCycle);

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={getPlanColorClasses(plan.id, selectedPlan === plan.id)}
                >
                  {isPopularPlan(plan.name) && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-1 rounded-full text-sm font-medium">
                        En Popüler
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getPlanIcon(plan.name)}
                      <h3 className="text-xl font-bold text-gray-900 ml-3">{plan.name}</h3>
                    </div>
                    {selectedPlan === plan.id && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="text-white" size={16} />
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      {/* FIXED: Show strikethrough price when there's a discount */}
                      {pricing.hasDiscount && pricing.originalPrice !== pricing.finalPrice && (
                        <span className="text-lg text-gray-500 line-through mr-3">
                          {pricing.originalPrice}
                        </span>
                      )}
                      <span className="text-4xl font-bold text-gray-900">
                        {pricing.finalPrice}
                      </span>
                      <span className="text-gray-600 ml-2">{plan.currency}</span>
                      <span className="text-gray-500 ml-1">
                        /{billingCycle === 'monthly' ? 'ay' : 'yıl'}
                      </span>
                    </div>
                    
                    {/* Show savings amount */}
                    {pricing.hasDiscount && pricing.discount > 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                          <Tag size={12} className="mr-1" />
                          {pricing.discount} {plan.currency} tasarruf!
                        </span>
                      </div>
                    )}
                    
                    {billingCycle === 'yearly' && !pricing.hasDiscount && (
                      <p className="text-sm text-green-600 mt-1">
                        Aylık {Math.round(pricing.finalPrice / 12)} {plan.currency}
                      </p>
                    )}
                    
                    {pricing.campaign && (
                      <div className="mt-2">
                        <span className="inline-flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          <Tag size={10} className="mr-1" />
                          {pricing.campaign.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Proje Limiti:</span>
                      <span className="font-medium">{plan.maxProjects === -1 ? 'Sınırsız' : plan.maxProjects}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tablo Limiti:</span>
                      <span className="font-medium">{plan.maxTables === -1 ? 'Sınırsız' : plan.maxTables}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-800 mb-3">Özellikler:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <Check size={14} className="text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <CreditCard className="text-blue-600 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-gray-800">Ödeme Bilgileri</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sipariş Özeti</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getPlanIcon(selectedPlanData?.name || '')}
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{selectedPlanData?.name} Plan</p>
                      <p className="text-sm text-gray-600">
                        {billingCycle === 'monthly' ? 'Aylık' : 'Yıllık'} Abonelik
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {currentPlanPricing?.hasDiscount && currentPlanPricing.originalPrice !== currentPlanPricing.finalPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        {currentPlanPricing.originalPrice} {selectedPlanData?.currency}
                      </p>
                    )}
                    <p className="text-2xl font-bold text-gray-900">
                      {currentPlanPricing?.finalPrice} {selectedPlanData?.currency}
                    </p>
                    <p className="text-sm text-gray-600">
                      {billingCycle === 'monthly' ? 'her ay' : 'her yıl'}
                    </p>
                  </div>
                </div>
                {currentPlanPricing?.hasDiscount && currentPlanPricing.discount > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 flex items-center">
                        <Tag size={14} className="mr-1" />
                        {currentPlanPricing.campaign?.name || 'İndirim'}:
                      </span>
                      <span className="text-green-600 font-medium">
                        -{currentPlanPricing.discount} {selectedPlanData?.currency} tasarruf
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <CreditCard className="mr-2" size={20} />
                    Kart Bilgileri
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kart Numarası
                      </label>
                      <input
                        type="text"
                        value={paymentData.cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Son Kullanma
                        </label>
                        <input
                          type="text"
                          value={paymentData.expiryDate}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={paymentData.cvv}
                          onChange={(e) => handleCvvChange(e.target.value)}
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kart Sahibi
                      </label>
                      <input
                        type="text"
                        value={paymentData.cardHolder}
                        onChange={(e) => handleInputChange('cardHolder', e.target.value)}
                        placeholder="Ad Soyad"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MapPin className="mr-2" size={20} />
                    Fatura Adresi
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta
                      </label>
                      <input
                        type="email"
                        value={paymentData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="ornek@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ad
                        </label>
                        <input
                          type="text"
                          value={paymentData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="Adınız"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Soyad
                        </label>
                        <input
                          type="text"
                          value={paymentData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Soyadınız"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adres
                      </label>
                      <input
                        type="text"
                        value={paymentData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Tam adresiniz"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Şehir
                        </label>
                        <input
                          type="text"
                          value={paymentData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Şehir"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Posta Kodu
                        </label>
                        <input
                          type="text"
                          value={paymentData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          placeholder="34000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="text-blue-600 mr-3" size={20} />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Güvenli Ödeme</p>
                    <p className="text-sm text-blue-600">
                      Tüm ödeme bilgileriniz SSL ile şifrelenir ve güvenli bir şekilde işlenir.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-between items-center pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center font-medium"
                >
                  <Lock className="mr-2" size={18} />
                  {currentPlanPricing?.finalPrice} {selectedPlanData?.currency} Öde ve Yükselt
                </button>
              </div>
            </form>
          </div>

          {/* HZMSoft Footer Branding */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Powered by <span className="font-semibold text-blue-600">HZMSoft</span> • Professional Software Solutions
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UpgradePlanPage;