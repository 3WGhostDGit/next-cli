/**
 * Exemples d'utilisation du générateur de formulaires
 * Démontre les différents cas d'usage et configurations
 */

import { FormGenerator, createFormConfig, FORM_PRESETS } from './index';
import type { FormConfig, FormField } from './index';

/**
 * Exemple 1: Formulaire de contact simple
 */
export function generateContactForm() {
  const config = FORM_PRESETS.contact;
  const generator = new FormGenerator(config);
  return generator.generate();
}

/**
 * Exemple 2: Formulaire utilisateur avec validation avancée
 */
export function generateUserForm() {
  const fields: FormField[] = [
    {
      name: 'firstName',
      type: 'text',
      label: 'Prénom',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50,
        messages: {
          minLength: 'Le prénom doit contenir au moins 2 caractères',
          maxLength: 'Le prénom ne peut pas dépasser 50 caractères',
        },
      },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Nom',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50,
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
      placeholder: 'nom@exemple.com',
    },
    {
      name: 'age',
      type: 'number',
      label: 'Âge',
      required: true,
      validation: {
        min: 18,
        max: 99,
        messages: {
          min: 'Vous devez avoir au moins 18 ans',
          max: 'Âge invalide',
        },
      },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rôle',
      required: true,
      options: [
        { value: 'user', label: 'Utilisateur' },
        { value: 'admin', label: 'Administrateur' },
        { value: 'moderator', label: 'Modérateur' },
      ],
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Biographie',
      placeholder: 'Parlez-nous de vous...',
      validation: {
        maxLength: 500,
      },
    },
    {
      name: 'newsletter',
      type: 'checkbox',
      label: 'Recevoir la newsletter',
      defaultValue: false,
    },
  ];

  const config = createFormConfig('User', fields, {
    description: 'Formulaire de création d\'utilisateur',
    features: ['toast-notifications'],
    actions: [
      {
        name: 'create',
        type: 'create',
        redirect: '/users',
        revalidate: ['/users'],
      },
    ],
    styling: {
      layout: 'single-column',
      spacing: 'normal',
      variant: 'card',
      submitButton: {
        text: 'Créer l\'utilisateur',
        loadingText: 'Création...',
        variant: 'default',
        size: 'default',
        fullWidth: true,
      },
    },
  });

  const generator = new FormGenerator(config);
  return generator.generate();
}

/**
 * Exemple 3: Formulaire multi-étapes avec upload de fichiers
 */
export function generateProfileForm() {
  const fields: FormField[] = [
    // Étape 1: Informations personnelles
    {
      name: 'avatar',
      type: 'file',
      label: 'Photo de profil',
      description: 'Formats acceptés: JPG, PNG (max 2MB)',
    },
    {
      name: 'displayName',
      type: 'text',
      label: 'Nom d\'affichage',
      required: true,
      validation: {
        minLength: 3,
        maxLength: 30,
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Biographie',
      placeholder: 'Décrivez-vous en quelques mots...',
      validation: {
        maxLength: 160,
      },
    },
    
    // Étape 2: Préférences
    {
      name: 'theme',
      type: 'select',
      label: 'Thème',
      required: true,
      options: [
        { value: 'light', label: 'Clair' },
        { value: 'dark', label: 'Sombre' },
        { value: 'system', label: 'Système' },
      ],
      defaultValue: 'system',
    },
    {
      name: 'language',
      type: 'select',
      label: 'Langue',
      required: true,
      options: [
        { value: 'fr', label: 'Français' },
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español' },
      ],
      defaultValue: 'fr',
    },
    {
      name: 'notifications',
      type: 'checkbox',
      label: 'Recevoir les notifications',
      defaultValue: true,
    },
    
    // Étape 3: Réseaux sociaux
    {
      name: 'website',
      type: 'text',
      label: 'Site web',
      placeholder: 'https://...',
      validation: {
        pattern: '^https?://.+',
        messages: {
          pattern: 'URL invalide (doit commencer par http:// ou https://)',
        },
      },
    },
    {
      name: 'twitter',
      type: 'text',
      label: 'Twitter',
      placeholder: '@username',
    },
    {
      name: 'linkedin',
      type: 'text',
      label: 'LinkedIn',
      placeholder: 'URL du profil LinkedIn',
    },
  ];

  const config = createFormConfig('Profile', fields, {
    description: 'Configurez votre profil utilisateur',
    features: ['file-upload', 'multi-step', 'auto-save', 'toast-notifications'],
    actions: [
      {
        name: 'update',
        type: 'update',
        revalidate: ['/profile'],
      },
    ],
    styling: {
      layout: 'single-column',
      spacing: 'relaxed',
      variant: 'default',
      submitButton: {
        text: 'Sauvegarder le profil',
        loadingText: 'Sauvegarde...',
        variant: 'default',
        size: 'lg',
        fullWidth: false,
      },
    },
  });

  const generator = new FormGenerator(config);
  return generator.generate();
}

/**
 * Exemple 4: Formulaire avec champs conditionnels
 */
export function generateOrderForm() {
  const fields: FormField[] = [
    {
      name: 'productType',
      type: 'select',
      label: 'Type de produit',
      required: true,
      options: [
        { value: 'physical', label: 'Produit physique' },
        { value: 'digital', label: 'Produit numérique' },
        { value: 'service', label: 'Service' },
      ],
    },
    {
      name: 'shippingAddress',
      type: 'textarea',
      label: 'Adresse de livraison',
      required: true,
      conditional: {
        dependsOn: 'productType',
        condition: 'equals',
        value: 'physical',
      },
    },
    {
      name: 'downloadEmail',
      type: 'email',
      label: 'Email pour le téléchargement',
      required: true,
      conditional: {
        dependsOn: 'productType',
        condition: 'equals',
        value: 'digital',
      },
    },
    {
      name: 'serviceDate',
      type: 'date',
      label: 'Date souhaitée pour le service',
      required: true,
      conditional: {
        dependsOn: 'productType',
        condition: 'equals',
        value: 'service',
      },
    },
    {
      name: 'quantity',
      type: 'number',
      label: 'Quantité',
      required: true,
      validation: {
        min: 1,
        max: 100,
      },
      defaultValue: 1,
    },
    {
      name: 'urgentDelivery',
      type: 'checkbox',
      label: 'Livraison urgente (+10€)',
      conditional: {
        dependsOn: 'productType',
        condition: 'equals',
        value: 'physical',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes supplémentaires',
      placeholder: 'Instructions spéciales...',
    },
  ];

  const config = createFormConfig('Order', fields, {
    description: 'Formulaire de commande avec options conditionnelles',
    features: ['conditional-fields', 'optimistic-ui', 'toast-notifications'],
    actions: [
      {
        name: 'create',
        type: 'create',
        redirect: '/orders/confirmation',
        revalidate: ['/orders'],
      },
    ],
    styling: {
      layout: 'single-column',
      spacing: 'normal',
      variant: 'card',
      submitButton: {
        text: 'Passer la commande',
        loadingText: 'Traitement...',
        variant: 'default',
        size: 'lg',
        fullWidth: true,
      },
    },
  });

  const generator = new FormGenerator(config);
  return generator.generate();
}

/**
 * Exemple 5: Formulaire CRUD complet
 */
export function generateProductForm() {
  const fields: FormField[] = [
    {
      name: 'name',
      type: 'text',
      label: 'Nom du produit',
      required: true,
      validation: {
        minLength: 3,
        maxLength: 100,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
      validation: {
        minLength: 10,
        maxLength: 1000,
      },
    },
    {
      name: 'price',
      type: 'number',
      label: 'Prix (€)',
      required: true,
      validation: {
        min: 0.01,
        max: 99999.99,
      },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Catégorie',
      required: true,
      options: [
        { value: 'electronics', label: 'Électronique' },
        { value: 'clothing', label: 'Vêtements' },
        { value: 'books', label: 'Livres' },
        { value: 'home', label: 'Maison' },
      ],
    },
    {
      name: 'tags',
      type: 'multiselect',
      label: 'Tags',
      options: [
        { value: 'new', label: 'Nouveau' },
        { value: 'sale', label: 'En promotion' },
        { value: 'featured', label: 'Mis en avant' },
        { value: 'limited', label: 'Édition limitée' },
      ],
    },
    {
      name: 'inStock',
      type: 'switch',
      label: 'En stock',
      defaultValue: true,
    },
    {
      name: 'images',
      type: 'file',
      label: 'Images du produit',
      description: 'Sélectionnez plusieurs images (JPG, PNG)',
    },
  ];

  const config = createFormConfig('Product', fields, {
    description: 'Gestion des produits - Créer, modifier, supprimer',
    features: ['file-upload', 'toast-notifications', 'optimistic-ui'],
    actions: [
      {
        name: 'create',
        type: 'create',
        redirect: '/products',
        revalidate: ['/products'],
      },
      {
        name: 'update',
        type: 'update',
        revalidate: ['/products'],
      },
      {
        name: 'delete',
        type: 'delete',
        redirect: '/products',
        revalidate: ['/products'],
      },
    ],
    styling: {
      layout: 'two-column',
      spacing: 'normal',
      variant: 'default',
      submitButton: {
        text: 'Sauvegarder',
        loadingText: 'Sauvegarde...',
        variant: 'default',
        size: 'default',
      },
    },
  });

  const generator = new FormGenerator(config);
  return generator.generate();
}

/**
 * Utilitaire pour tester la génération de tous les exemples
 */
export function generateAllExamples() {
  return {
    contact: generateContactForm(),
    user: generateUserForm(),
    profile: generateProfileForm(),
    order: generateOrderForm(),
    product: generateProductForm(),
  };
}
