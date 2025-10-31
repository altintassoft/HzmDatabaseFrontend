import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Users, Shield, Zap, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import LanguageSelector from '../../../components/shared/LanguageSelector';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Database className="text-blue-600" size={32} />
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-lg font-bold text-blue-600 tracking-wider">HZMSoft</span>
              </div>
              <div className="text-sm text-gray-600 font-medium">DataBase Pro</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSelector variant="compact" />
            <button
              onClick={() => navigate('/login')}
              className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <LogIn size={18} className="mr-2" />
              Giriş Yap
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={18} className="mr-2" />
              Kayıt Ol
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-full mb-4">
              <span className="text-blue-600 font-bold text-sm tracking-wider">HZMSoft</span>
              <span className="mx-2 text-blue-400">•</span>
              <span className="text-blue-600 text-sm">Profesyonel Yazılım Çözümleri</span>
            </div>
          </div>
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Veritabanı Yönetimini
            <span className="text-blue-600 block">Kolaylaştırın</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            HZMSoft DataBase Pro ile profesyonel veritabanı tasarımı ve yönetimi için ihtiyacınız olan her şey. 
            Tablolar oluşturun, alanları düzenleyin ve verilerinizi kolayca yönetin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Ücretsiz Başlayın
              <ArrowRight size={20} className="ml-2" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center px-8 py-4 border-2 border-blue-600 text-blue-600 text-lg font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Neden HZMSoft DataBase Pro?</h3>
          <p className="text-lg text-gray-600">Modern veritabanı yönetimi için güçlü özellikler</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <Database className="text-blue-600" size={32} />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Kolay Tablo Yönetimi</h4>
            <p className="text-gray-600">
              Sürükle-bırak ile tablolarınızı oluşturun, alanları düzenleyin ve 
              veritabanı yapınızı görsel olarak tasarlayın.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <Users className="text-green-600" size={32} />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Çoklu Kullanıcı Desteği</h4>
            <p className="text-gray-600">
              Ekibinizle birlikte çalışın. Her kullanıcı kendi projelerini 
              yönetebilir ve güvenli bir şekilde erişim sağlayabilir.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <Zap className="text-purple-600" size={32} />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Hızlı ve Güvenli</h4>
            <p className="text-gray-600">
              Verileriniz güvenli bir şekilde saklanır ve hızlı erişim 
              için optimize edilmiş arayüz ile çalışırsınız.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Hemen Başlamaya Hazır mısınız?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Ücretsiz hesap oluşturun ve HZMSoft DataBase Pro ile veritabanı yönetiminin keyfini çıkarın.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            <UserPlus size={20} className="mr-2" />
            Ücretsiz Kayıt Ol
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Database className="text-blue-400" size={32} />
              <div className="flex flex-col items-start">
                <span className="text-xl font-bold text-blue-400 tracking-wider">HZMSoft</span>
                <span className="text-gray-300 text-sm">DataBase Pro</span>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-6">
              <p className="text-gray-400 mb-2">
                © 2025 HZMSoft. Tüm hakları saklıdır.
              </p>
              <p className="text-gray-500 text-sm">
                Profesyonel yazılım çözümleri ve veritabanı yönetim sistemleri
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;