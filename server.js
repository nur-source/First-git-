const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Fichier de données
const dataFile = path.join(__dirname, 'leads.json');

// Initialiser les données
function initializeData() {
    if (!fs.existsSync(dataFile)) {
        const initialData = {
            leads: [
                {
                    id: 1,
                    nom: 'Jean Dupont',
                    phone: '+33612345678',
                    email: 'jean@example.com',
                    statut: 'Nouveau',
                    source: 'WhatsApp',
                    score: 'Chaud',
                    notes: 'Très intéressé par coaching perso',
                    dateAjout: new Date().toISOString(),
                    dateRelance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        };
        fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
    }
}

// Lire les données
function readLeads() {
    try {
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lecture fichier:', error);
        return { leads: [] };
    }
}

// Sauvegarder les données
function saveLeads(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// API ROUTES

// 1. Obtenir tous les leads
app.get('/api/leads', (req, res) => {
    const data = readLeads();
    res.json(data.leads);
});

// 2. Ajouter un lead
app.post('/api/leads', (req, res) => {
    const data = readLeads();
    const newLead = {
        id: Math.max(...data.leads.map(l => l.id), 0) + 1,
        ...req.body,
        dateAjout: new Date().toISOString(),
        dateRelance: req.body.dateRelance || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    data.leads.push(newLead);
    saveLeads(data);
    res.status(201).json(newLead);
});

// 3. Mettre à jour un lead
app.put('/api/leads/:id', (req, res) => {
    const data = readLeads();
    const index = data.leads.findIndex(l => l.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({ error: 'Lead non trouvé' });
    }

    data.leads[index] = {
        ...data.leads[index],
        ...req.body,
        id: data.leads[index].id,
        dateAjout: data.leads[index].dateAjout
    };
    saveLeads(data);
    res.json(data.leads[index]);
});

// 4. Supprimer un lead
app.delete('/api/leads/:id', (req, res) => {
    const data = readLeads();
    data.leads = data.leads.filter(l => l.id !== parseInt(req.params.id));
    saveLeads(data);
    res.json({ success: true });
});

// 5. Obtenir les statistiques
app.get('/api/stats', (req, res) => {
    const data = readLeads();
    const leads = data.leads;

    const stats = {
        total: leads.length,
        parStatut: {
            Nouveau: leads.filter(l => l.statut === 'Nouveau').length,
            Contacté: leads.filter(l => l.statut === 'Contacté').length,
            'RDV Pris': leads.filter(l => l.statut === 'RDV Pris').length,
            Converti: leads.filter(l => l.statut === 'Converti').length
        },
        parScore: {
            'Chaud': leads.filter(l => l.score === 'Chaud').length,
            'Tiède': leads.filter(l => l.score === 'Tiède').length,
            'Froid': leads.filter(l => l.score === 'Froid').length
        },
        parSource: {
            'WhatsApp': leads.filter(l => l.source === 'WhatsApp').length,
            'SMS': leads.filter(l => l.source === 'SMS').length,
            'Google': leads.filter(l => l.source === 'Google').length,
            'Walk-in': leads.filter(l => l.source === 'Walk-in').length,
            'Autre': leads.filter(l => l.source === 'Autre').length
        }
    };

    res.json(stats);
});

// 6. Envoyer SMS (prêt pour Twilio)
app.post('/api/send-sms', (req, res) => {
    const { phone, message } = req.body;

    // TODO: Intégrer Twilio ici
    console.log(`SMS à ${phone}: ${message}`);

    res.json({
        success: true,
        message: 'SMS simulé (À connecter avec Twilio)',
        details: { phone, message }
    });
});

// 7. Envoyer WhatsApp (prêt pour Twilio/Meta)
app.post('/api/send-whatsapp', (req, res) => {
    const { phone, message } = req.body;

    // TODO: Intégrer Twilio WhatsApp API ici
    console.log(`WhatsApp à ${phone}: ${message}`);

    res.json({
        success: true,
        message: 'WhatsApp simulé (À connecter avec Twilio/Meta)',
        details: { phone, message }
    });
});

// Démarrer le serveur
initializeData();
app.listen(PORT, () => {
    console.log(`✅ CRM Personnel démarré sur http://localhost:${PORT}`);
    console.log('Appuyez sur Ctrl+C pour arrêter');
});
