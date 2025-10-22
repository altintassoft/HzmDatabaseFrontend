import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { 
  DollarSign, 
  ArrowLeft, 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Crown,
  Check,
  Calendar,
  Percent,
  Tag,
  Eye,
  EyeOff,
  Gift,
  Clock,
  Zap,
  CreditCard
} from 'lucide-react';
import { PricingPlan, Campaign } from '../types';

const DatabasePricing = () => {
  const { state, dispatch } = useDatabase();
  const navigate = useNavigate();
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'campaigns'>('plans');

  const handlePlanSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const plan: PricingPlan = {
      id: editingPlan?.id || Date.now().toString(),
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      yearlyPrice: Number(formData.get('yearlyPrice')) || undefined,
      currency: formData.get('currency') as string,
      duration: formData.get('duration') as 'monthly' | 'yearly',
      maxProjects: Number(formData.get('maxProjects')),
      maxTables: Number(formData.get('maxTables')),
      features: (formData.get('features') as string).split('\n').filter(f => f.trim()),
      isActive: true,
      planType: formData.get('planType') as 'general' | 'custom',
      campaignId: formData.get('campaignId') as string || undefined,
      setupFee: Number(formData.get('setupFee')) || undefined,
      trialDays: Number(formData.get('trialDays')) || undefined,
    };

    if (editingPlan) {
      dispatch({ type: 'UPDATE_PRICING_PLAN', payload: { plan } });
    } else {
      dispatch({ type: 'ADD_PRICING_PLAN', payload: { plan } });
    }

    setEditingPlan(null);
    setShowPlanForm(false);
  };

  const handleCampaignSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const campaign: Campaign = {
      id: editingCampaign?.id || Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      discountType: formData.get('discountType') as 'percentage' | 'fixed' | 'free_trial',
      discountValue: Number(formData.get('discountValue')),
      applicableDuration: formData.get('applicableDuration') as 'monthly' | 'yearly' | 'both',
      isActive: formData.get('isActive') === 'on',
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      applicablePlans: (formData.get('applicablePlans') as string).split(',').filter(p => p.trim()),
      createdAt: editingCampaign?.createdAt || new Date().toISOString(),
      
      // Enhanced options
      freeTrialMonths: Number(formData.get('freeTrialMonths')) || undefined,
      autoChargeAfterTrial: formData.get('autoChargeAfterTrial') === 'on',
      
      // Billing cycle specific discounts
      monthlyDiscount: formData.get('monthlyDiscountValue') ? {
        type: formData.get('monthlyDiscountType') as 'percentage' | 'fixed',
        value: Number(formData.get('monthlyDiscountValue'))
      } : undefined,
      
      yearlyDiscount: formData.get('yearlyDiscountValue') ? {
        type: formData.get('yearlyDiscountType') as 'percentage' | 'fixed',
        value: Number(formData.get('yearlyDiscountValue'))
      } : undefined,
      
      conditions: {
        newUsersOnly: formData.get('newUsersOnly') === 'on',
        maxUsagePerUser: Number(formData.get('maxUsagePerUser')) || undefined,
        minSubscriptionMonths: Number(formData.get('minSubscriptionMonths')) || undefined,
      }
    };

    if (editingCampaign) {
      dispatch({ type: 'UPDATE_CAMPAIGN', payload: { campaign } });
    } else {
      dispatch({ type: 'ADD_CAMPAIGN', payload: { campaign } });
    }

    setEditingCampaign(null);
    setShowCampaignForm(false);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Bu planı silmek istediğinizden emin misiniz?')) {
      dispatch({ type: 'DELETE_PRICING_PLAN', payload: { planId } });
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) {
      dispatch({ type: 'DELETE_CAMPAIGN', payload: { campaignId } });
    }
  };

  const getPlanColor = (planName: string, planType: 'general' | 'custom') => {
    if (planType === 'custom') return 'border-orange-300 bg-orange-50';
    const name = planName.toLowerCase();
    if (name.includes('ücretsiz') || name.includes('free')) return 'border-gray-300 bg-gray-50';
    if (name.includes('temel') || name.includes('basic')) return 'border-blue-300 bg-blue-50';
    if (name.includes('premium')) return 'border-purple-300 bg-purple-50';
    if (name.includes('kurumsal') || name.includes('enterprise')) return 'border-yellow-300 bg-yellow-50';
    return 'border-gray-300 bg-gray-50';
  };

  const getPlanIcon = (planName: string, planType: 'general' | 'custom') => {
    if (planType === 'custom') return <Tag className="text-orange-500" size={20} />;
    const name = planName.toLowerCase();
    if (name.includes('premium') || name.includes('kurumsal') || name.includes('enterprise')) {
      return <Crown className="text-yellow-500" size={20} />;
    }
    return <DollarSign className="text-green-500" size={20} />;
  };

  const getCampaignIcon = (discountType: string) => {
    switch (discountType) {
      case 'free_trial': return <Gift className="text-green-500" size={20} />;
      case 'percentage': return <Percent className="text-blue-500" size={20} />;
      case 'fixed': return <DollarSign className="text-purple-500" size={20} />;
      default: return <Tag className="text-gray-500" size={20} />;
    }
  };

  const getCampaignById = (campaignId: string) => {
    return state.campaigns.find(c => c.id === campaignId);
  };

  const getActiveCampaigns = () => {
    return state.campaigns.filter(c => c.isActive && new Date(c.endDate) > new Date());
  };

  const formatCampaignDiscount = (campaign: Campaign, billingCycle: 'monthly' | 'yearly') => {
    if (campaign.discountType === 'free_trial') {
      return `${campaign.freeTrialMonths} ay ücretsiz`;
    }
    
    if (campaign.applicableDuration === 'both') {
      const discount = billingCycle === 'monthly' ? campaign.monthlyDiscount : campaign.yearlyDiscount;
      if (discount) {
        return discount.type === 'percentage' ? `%${discount.value}` : `${discount.value} TL`;
      }
    }
    
    return campaign.discountType === 'percentage' ? `%${campaign.discountValue}` : `${campaign.discountValue} TL`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <button
            onClick={() => navigate('/admin')}
            className="mr-4 hover:bg-purple-700 p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center">
            <DollarSign size={28} className="mr-3" />
            <h1 className="text-2xl font-bold">HZMSoft - Fiyatlandırma & Kampanyalar</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Enhanced Stats Cards */}
        <div className="grid md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Plan</p>
                <p className="text-3xl font-bold text-purple-600">{state.pricingPlans.length}</p>
              </div>
              <DollarSign className="text-purple-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Genel Plan</p>
                <p className="text-3xl font-bold text-blue-600">
                  {state.pricingPlans.filter(p => p.planType === 'general').length}
                </p>
              </div>
              <Eye className="text-blue-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Özel Plan</p>
                <p className="text-3xl font-bold text-orange-600">
                  {state.pricingPlans.filter(p => p.planType === 'custom').length}
                </p>
              </div>
              <EyeOff className="text-orange-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kampanya</p>
                <p className="text-3xl font-bold text-green-600">{state.campaigns.length}</p>
              </div>
              <Tag className="text-green-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Kampanya</p>
                <p className="text-3xl font-bold text-red-600">{getActiveCampaigns().length}</p>
              </div>
              <Zap className="text-red-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deneme Kampanyası</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {state.campaigns.filter(c => c.discountType === 'free_trial').length}
                </p>
              </div>
              <Gift className="text-indigo-600" size={40} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('plans')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'plans'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DollarSign size={16} className="inline mr-2" />
                Fiyatlandırma Planları
              </button>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'campaigns'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Tag size={16} className="inline mr-2" />
                Kampanya Yönetimi
              </button>
            </nav>
          </div>
        </div>

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <>
            {/* Add Plan Button */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Fiyatlandırma Planları</h3>
              <button
                onClick={() => setShowPlanForm(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus size={18} className="mr-2" />
                Yeni Plan Ekle
              </button>
            </div>

            {/* Pricing Plans Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {state.pricingPlans.map((plan) => (
                <div key={plan.id} className={`rounded-lg border-2 p-6 hover:shadow-lg transition-all ${getPlanColor(plan.name, plan.planType)}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      {getPlanIcon(plan.name, plan.planType)}
                      <div className="ml-2">
                        <h4 className="text-lg font-semibold text-gray-800">{plan.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          plan.planType === 'custom' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {plan.planType === 'custom' ? 'Özel Plan' : 'Genel Plan'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingPlan(plan);
                          setShowPlanForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.currency}</span>
                      <span className="text-gray-500 ml-1">/ay</span>
                    </div>
                    {plan.yearlyPrice && (
                      <div className="text-sm text-green-600 mt-1">
                        Yıllık: {plan.yearlyPrice} {plan.currency} (%{Math.round((1 - plan.yearlyPrice / (plan.price * 12)) * 100)} indirim)
                      </div>
                    )}
                    {plan.trialDays && (
                      <div className="text-sm text-blue-600 mt-1 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {plan.trialDays} gün ücretsiz deneme
                      </div>
                    )}
                    {plan.campaignId && (
                      <div className="mt-2">
                        {(() => {
                          const campaign = getCampaignById(plan.campaignId);
                          return campaign ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              🎉 {campaign.name}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Proje Limiti:</span>
                      <span className="font-medium">{plan.maxProjects === -1 ? 'Sınırsız' : plan.maxProjects}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tablo Limiti:</span>
                      <span className="font-medium">{plan.maxTables === -1 ? 'Sınırsız' : plan.maxTables}</span>
                    </div>
                    {plan.setupFee && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Kurulum Ücreti:</span>
                        <span className="font-medium">{plan.setupFee} {plan.currency}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-800 mb-2">Özellikler:</h5>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <Check size={12} className="text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-gray-500">+{plan.features.length - 3} özellik daha...</li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Durum:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        plan.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {plan.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Enhanced Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <>
            {/* Add Campaign Button */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Kampanya Yönetimi</h3>
              <button
                onClick={() => setShowCampaignForm(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus size={18} className="mr-2" />
                Yeni Kampanya Ekle
              </button>
            </div>

            {/* Enhanced Campaigns Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      {getCampaignIcon(campaign.discountType)}
                      <div className="ml-2">
                        <h4 className="text-lg font-semibold text-gray-800">{campaign.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          campaign.discountType === 'free_trial' ? 'bg-green-100 text-green-800' :
                          campaign.discountType === 'percentage' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {campaign.discountType === 'free_trial' ? 'Ücretsiz Deneme' :
                           campaign.discountType === 'percentage' ? 'Yüzde İndirim' : 'Sabit İndirim'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingCampaign(campaign);
                          setShowCampaignForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>

                  <div className="space-y-2 mb-4">
                    {campaign.discountType === 'free_trial' ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ücretsiz Süre:</span>
                          <span className="font-medium">{campaign.freeTrialMonths} ay</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Otomatik Ücretlendirme:</span>
                          <span className="font-medium">{campaign.autoChargeAfterTrial ? 'Evet' : 'Hayır'}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {campaign.applicableDuration === 'both' ? (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Aylık İndirim:</span>
                              <span className="font-medium">{formatCampaignDiscount(campaign, 'monthly')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Yıllık İndirim:</span>
                              <span className="font-medium">{formatCampaignDiscount(campaign, 'yearly')}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">İndirim:</span>
                            <span className="font-medium">{formatCampaignDiscount(campaign, campaign.applicableDuration as 'monthly' | 'yearly')}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Geçerli Dönem:</span>
                      <span className="font-medium capitalize">
                        {campaign.applicableDuration === 'both' ? 'Aylık & Yıllık' : 
                         campaign.applicableDuration === 'monthly' ? 'Aylık' : 'Yıllık'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Başlangıç:</span>
                      <span className="font-medium">{new Date(campaign.startDate).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bitiş:</span>
                      <span className="font-medium">{new Date(campaign.endDate).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>

                  {/* Campaign Conditions */}
                  {campaign.conditions && Object.keys(campaign.conditions).length > 0 && (
                    <div className="border-t pt-4 mb-4">
                      <h5 className="font-medium text-gray-800 mb-2">Koşullar:</h5>
                      <div className="space-y-1">
                        {campaign.conditions.newUsersOnly && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Sadece Yeni Kullanıcılar
                          </span>
                        )}
                        {campaign.conditions.maxUsagePerUser && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Max {campaign.conditions.maxUsagePerUser} kullanım/kişi
                          </span>
                        )}
                        {campaign.conditions.minSubscriptionMonths && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            Min {campaign.conditions.minSubscriptionMonths} ay abonelik
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-800 mb-2">Geçerli Planlar:</h5>
                    <div className="flex flex-wrap gap-1">
                      {campaign.applicablePlans.map((planType, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {planType}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Durum:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        campaign.isActive && new Date(campaign.endDate) > new Date()
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {campaign.isActive && new Date(campaign.endDate) > new Date() ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {state.campaigns.length === 0 && (
              <div className="text-center py-12">
                <Tag className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz kampanya bulunmuyor</h3>
                <p className="text-gray-500 mb-4">İlk kampanyanızı oluşturun.</p>
                <button
                  onClick={() => setShowCampaignForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus size={18} className="mr-2" />
                  İlk Kampanyayı Oluştur
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Enhanced Plan Form Modal */}
      {showPlanForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingPlan ? 'Planı Düzenle' : 'Yeni Plan Ekle'}
              </h3>
              <button
                onClick={() => {
                  setShowPlanForm(false);
                  setEditingPlan(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Adı
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingPlan?.name || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Örn: Premium Plan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Türü
                  </label>
                  <select
                    name="planType"
                    defaultValue={editingPlan?.planType || 'general'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="general">Genel Plan (Kullanıcılarda görünür)</option>
                    <option value="custom">Özel Plan (Sadece admin atayabilir)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aylık Fiyat
                  </label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingPlan?.price || 0}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yıllık Fiyat (İsteğe Bağlı)
                  </label>
                  <input
                    type="number"
                    name="yearlyPrice"
                    defaultValue={editingPlan?.yearlyPrice || ''}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Yıllık indirimli fiyat"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Para Birimi
                  </label>
                  <select
                    name="currency"
                    defaultValue={editingPlan?.currency || 'TL'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="TL">TL</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Süre
                  </label>
                  <select
                    name="duration"
                    defaultValue={editingPlan?.duration || 'monthly'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="monthly">Aylık</option>
                    <option value="yearly">Yıllık</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kurulum Ücreti (İsteğe Bağlı)
                  </label>
                  <input
                    type="number"
                    name="setupFee"
                    defaultValue={editingPlan?.setupFee || ''}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deneme Süresi (Gün)
                  </label>
                  <input
                    type="number"
                    name="trialDays"
                    defaultValue={editingPlan?.trialDays || ''}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Proje (-1 = Sınırsız)
                  </label>
                  <input
                    type="number"
                    name="maxProjects"
                    defaultValue={editingPlan?.maxProjects || 1}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Tablo (-1 = Sınırsız)
                  </label>
                  <input
                    type="number"
                    name="maxTables"
                    defaultValue={editingPlan?.maxTables || 5}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kampanya
                </label>
                <select
                  name="campaignId"
                  defaultValue={editingPlan?.campaignId || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Kampanya Seçin (İsteğe Bağlı)</option>
                  {getActiveCampaigns().map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Özellikler (Her satıra bir özellik)
                </label>
                <textarea
                  name="features"
                  rows={4}
                  defaultValue={editingPlan?.features.join('\n') || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Temel Destek&#10;E-posta Desteği&#10;Veri Dışa Aktarma"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanForm(false);
                    setEditingPlan(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                >
                  <Save size={16} className="mr-2" />
                  {editingPlan ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Campaign Form Modal */}
      {showCampaignForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCampaign ? 'Kampanyayı Düzenle' : 'Yeni Kampanya Ekle'}
              </h3>
              <button
                onClick={() => {
                  setShowCampaignForm(false);
                  setEditingCampaign(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCampaignSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kampanya Adı
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingCampaign?.name || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Örn: Yıllık Plan İndirimi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kampanya Türü
                  </label>
                  <select
                    name="discountType"
                    defaultValue={editingCampaign?.discountType || 'percentage'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="percentage">Yüzde İndirim (%)</option>
                    <option value="fixed">Sabit Tutar İndirim (TL)</option>
                    <option value="free_trial">Ücretsiz Deneme</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <input
                  type="text"
                  name="description"
                  defaultValue={editingCampaign?.description || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Örn: 2 Ay Ücretsiz - Yıllık planlarda %17 indirim"
                />
              </div>

              {/* Discount Configuration */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">İndirim Yapılandırması</h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Geçerli Dönem
                    </label>
                    <select
                      name="applicableDuration"
                      defaultValue={editingCampaign?.applicableDuration || 'both'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="monthly">Sadece Aylık</option>
                      <option value="yearly">Sadece Yıllık</option>
                      <option value="both">Aylık & Yıllık</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temel İndirim Miktarı
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      defaultValue={editingCampaign?.discountValue || 0}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Separate Monthly/Yearly Discounts */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="border border-blue-200 p-3 rounded-lg bg-blue-50">
                    <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                      <CreditCard size={16} className="mr-2" />
                      Aylık Plan İndirimi
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        name="monthlyDiscountType"
                        defaultValue={editingCampaign?.monthlyDiscount?.type || 'percentage'}
                        className="px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="percentage">Yüzde (%)</option>
                        <option value="fixed">Sabit (TL)</option>
                      </select>
                      <input
                        type="number"
                        name="monthlyDiscountValue"
                        defaultValue={editingCampaign?.monthlyDiscount?.value || ''}
                        placeholder="Miktar"
                        className="px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="border border-purple-200 p-3 rounded-lg bg-purple-50">
                    <h5 className="font-medium text-purple-800 mb-2 flex items-center">
                      <Calendar size={16} className="mr-2" />
                      Yıllık Plan İndirimi
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        name="yearlyDiscountType"
                        defaultValue={editingCampaign?.yearlyDiscount?.type || 'percentage'}
                        className="px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="percentage">Yüzde (%)</option>
                        <option value="fixed">Sabit (TL)</option>
                      </select>
                      <input
                        type="number"
                        name="yearlyDiscountValue"
                        defaultValue={editingCampaign?.yearlyDiscount?.value || ''}
                        placeholder="Miktar"
                        className="px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Free Trial Configuration */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-3 flex items-center">
                  <Gift size={16} className="mr-2" />
                  Ücretsiz Deneme Ayarları
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ücretsiz Ay Sayısı
                    </label>
                    <input
                      type="number"
                      name="freeTrialMonths"
                      defaultValue={editingCampaign?.freeTrialMonths || ''}
                      min="1"
                      max="12"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Örn: 3"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="autoChargeAfterTrial"
                      defaultChecked={editingCampaign?.autoChargeAfterTrial || false}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Deneme sonrası otomatik ücretlendirme
                    </label>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={editingCampaign?.startDate || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={editingCampaign?.endDate || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Applicable Plans */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geçerli Planlar (virgülle ayırın)
                </label>
                <input
                  type="text"
                  name="applicablePlans"
                  defaultValue={editingCampaign?.applicablePlans.join(', ') || 'basic, premium, enterprise'}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="basic, premium, enterprise"
                />
              </div>

              {/* Campaign Conditions */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-3">Kampanya Koşulları</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="newUsersOnly"
                      defaultChecked={editingCampaign?.conditions?.newUsersOnly || false}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Sadece yeni kullanıcılar
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max kullanım/kişi
                    </label>
                    <input
                      type="number"
                      name="maxUsagePerUser"
                      defaultValue={editingCampaign?.conditions?.maxUsagePerUser || ''}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min abonelik (ay)
                    </label>
                    <input
                      type="number"
                      name="minSubscriptionMonths"
                      defaultValue={editingCampaign?.conditions?.minSubscriptionMonths || ''}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={editingCampaign?.isActive !== false}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Kampanyayı aktif et
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCampaignForm(false);
                    setEditingCampaign(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <Save size={16} className="mr-2" />
                  {editingCampaign ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabasePricing;