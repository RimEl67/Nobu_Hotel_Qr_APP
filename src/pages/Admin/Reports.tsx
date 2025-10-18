import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, BarChart3 } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const AdminReports: React.FC = () => {
  const [reportConfig, setReportConfig] = useState({
    title: 'Rapport Mensuel Nobu Hotel',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    includeStats: true,
    includeGuests: true,
    includeOrders: true,
    includeReservations: true,
    notes: ''
  });
  const [generating, setGenerating] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Header
      pdf.setFillColor(249, 115, 22); // Orange
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      // Logo placeholder
      pdf.setFillColor(255, 255, 255);
      pdf.rect(15, 8, 14, 14, 'F');
      pdf.setTextColor(249, 115, 22);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('N', 22, 18);
      
      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text('NOBU HOTEL MARRAKECH', 35, 16);
      pdf.setFontSize(12);
      pdf.text('Rapport de Gestion Hôtelière', 35, 24);
      
      // Report title and date
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(reportConfig.title, 15, 45);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Période: ${new Date(reportConfig.startDate).toLocaleDateString('fr-FR')} - ${new Date(reportConfig.endDate).toLocaleDateString('fr-FR')}`, 15, 52);
      pdf.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 15, 58);
      
      let yPosition = 70;
      
      // Statistics Section
      if (reportConfig.includeStats) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('📊 Statistiques Générales', 15, yPosition);
        yPosition += 10;
        
        const stats = [
          { label: 'Nombre total de clients', value: '89' },
          { label: 'Commandes traitées', value: '156' },
          { label: 'Réservations d\'activités', value: '67' },
          { label: 'Revenus générés', value: '15,420€' },
          { label: 'Taux de satisfaction', value: '94%' }
        ];
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        stats.forEach(stat => {
          pdf.text(`• ${stat.label}: ${stat.value}`, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 5;
      }
      
      // Guests Section
      if (reportConfig.includeGuests) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('👥 Analyse Clientèle', 15, yPosition);
        yPosition += 10;
        
        const guestStats = [
          'Nouveaux clients: 23 (+15% vs mois précédent)',
          'Clients fidèles: 66 (74% de la clientèle)',
          'Durée moyenne de séjour: 3.2 jours',
          'Taux d\'occupation: 87%',
          'Origine principale: France (45%), Maroc (30%), International (25%)'
        ];
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        guestStats.forEach(stat => {
          pdf.text(`• ${stat}`, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 5;
      }
      
      // Orders Section
      if (reportConfig.includeOrders) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🍽️ Restauration & Commandes', 15, yPosition);
        yPosition += 10;
        
        const orderStats = [
          'Commandes restaurant: 98 (63% du total)',
          'Room service: 58 (37% du total)',
          'Panier moyen: 98€',
          'Plat le plus commandé: Miso Black Cod (45 commandes)',
          'Heures de pointe: 19h-21h (35% des commandes)'
        ];
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        orderStats.forEach(stat => {
          pdf.text(`• ${stat}`, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 5;
      }
      
      // Reservations Section
      if (reportConfig.includeReservations) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('📅 Activités & Réservations', 15, yPosition);
        yPosition += 10;
        
        const reservationStats = [
          'Réservations spa: 38 (57% des activités)',
          'Cours de cuisine: 15 (22% des activités)',
          'Sessions yoga: 14 (21% des activités)',
          'Taux d\'approbation: 92%',
          'Créneaux les plus demandés: 14h-16h (spa), 10h-12h (cuisine)'
        ];
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        reservationStats.forEach(stat => {
          pdf.text(`• ${stat}`, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 5;
      }
      
      // Notes section
      if (reportConfig.notes) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('📝 Notes & Observations', 15, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(reportConfig.notes, pageWidth - 30);
        pdf.text(lines, 15, yPosition);
        yPosition += lines.length * 5;
      }
      
      // Footer
      const footerY = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Nobu Hotel Marrakech - Avenue Mohammed VI, Marrakech', 15, footerY);
      pdf.text(`Page 1 - Confidentiel`, pageWidth - 40, footerY);
      
      // Save PDF
      const fileName = `rapport-nobu-${reportConfig.startDate}-${reportConfig.endDate}.pdf`;
      pdf.save(fileName);
      
      toast.success('Rapport PDF généré avec succès!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setGenerating(false);
    }
  };

  const quickReports = [
    {
      title: 'Rapport Journalier',
      description: 'Activité des dernières 24h',
      period: 'day',
      icon: '📊'
    },
    {
      title: 'Rapport Hebdomadaire',
      description: 'Résumé de la semaine',
      period: 'week',
      icon: '📈'
    },
    {
      title: 'Rapport Mensuel',
      description: 'Analyse mensuelle complète',
      period: 'month',
      icon: '📋'
    }
  ];

  const generateQuickReport = (period: string) => {
    const today = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate = new Date(today);
        break;
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
    }
    
    setReportConfig(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      title: `Rapport ${period === 'day' ? 'Journalier' : period === 'week' ? 'Hebdomadaire' : 'Mensuel'} Nobu Hotel`
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Génération de Rapports</h1>
          <p className="text-gray-600">Créez des rapports PDF personnalisés</p>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickReports.map((report, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-3xl mb-2">{report.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateQuickReport(report.period)}
                className="w-full"
              >
                Utiliser ce modèle
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Custom Report Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Form */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration du Rapport</h3>
          
          <div className="space-y-4">
            <Input
              label="Titre du rapport"
              value={reportConfig.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ex: Rapport Mensuel Janvier 2024"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date de début"
                type="date"
                value={reportConfig.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
              <Input
                label="Date de fin"
                type="date"
                value={reportConfig.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Sections à inclure</label>
              <div className="space-y-2">
                {[
                  { key: 'includeStats', label: 'Statistiques générales' },
                  { key: 'includeGuests', label: 'Analyse clientèle' },
                  { key: 'includeOrders', label: 'Commandes & restauration' },
                  { key: 'includeReservations', label: 'Réservations d\'activités' }
                ].map(section => (
                  <label key={section.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={reportConfig[section.key as keyof typeof reportConfig] as boolean}
                      onChange={(e) => handleInputChange(section.key, e.target.checked)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">{section.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes & Observations</label>
              <textarea
                value={reportConfig.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Ajoutez des notes personnalisées, observations ou commentaires..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Preview & Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu du Rapport</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="text-orange-500" size={24} />
              <div>
                <h4 className="font-medium text-gray-900">{reportConfig.title}</h4>
                <p className="text-sm text-gray-600">
                  {new Date(reportConfig.startDate).toLocaleDateString('fr-FR')} - {new Date(reportConfig.endDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>📄 Format: PDF</p>
              <p>📊 Sections: {Object.values(reportConfig).filter(v => v === true).length} incluses</p>
              <p>📅 Période: {Math.ceil((new Date(reportConfig.endDate).getTime() - new Date(reportConfig.startDate).getTime()) / (1000 * 60 * 60 * 24))} jours</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={generatePDF}
              loading={generating}
              variant="primary"
              size="lg"
              className="w-full"
            >
              <Download size={20} className="mr-2" />
              {generating ? 'Génération en cours...' : 'Générer le Rapport PDF'}
            </Button>
            
            <div className="text-xs text-gray-500 text-center">
              Le rapport sera téléchargé automatiquement une fois généré
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapports Récents</h3>
        <div className="space-y-3">
          {[
            { name: 'Rapport Mensuel Janvier 2024', date: '2024-02-01', size: '2.3 MB' },
            { name: 'Rapport Hebdomadaire S4', date: '2024-01-28', size: '1.8 MB' },
            { name: 'Rapport Journalier 27/01', date: '2024-01-27', size: '0.9 MB' }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="text-gray-400" size={20} />
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-600">{report.date} • {report.size}</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Download size={16} />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminReports;