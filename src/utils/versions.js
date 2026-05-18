export const CURRENT_VERSION = '1.7.0';

export const VERSION_HISTORY = [
  {
    version: '1.7.0',
    date: '17 de Mayo, 2026',
    title: 'Registro de Múltiples Labores e Integración de Inventario',
    description: 'Habilitada la capacidad de registrar hasta tres labores diferentes por día con asignación de horas individualizadas, y visualización directa de labores registradas en la sección de Inventario de Lotes.',
    type: 'feature',
    changes: [
      'Implementado formulario dinámico multitarea en el Registro de Labores, permitiendo adicionar hasta 3 labores por fecha/responsable.',
      'Añadida la asignación y visualización del tiempo de trabajo en horas para cada labor registrada.',
      'Sincronización en tiempo real con el Inventario de Lotes: cada tarjeta de lote ahora refleja su historial de labores recientes y total de horas acumuladas.'
    ]
  },
  {
    version: '1.6.0',
    date: '17 de Mayo, 2026',
    title: 'Edición de Labores y Mantenimiento',
    description: 'Habilitada la edición y eliminación de registros de labores (actividades) en los lotes. Optimización del flujo de actualización en tiempo real en Firestore.',
    type: 'feature',
    changes: [
      'Se añadió la columna de Acciones al Registro de Labores para permitir la edición y eliminación de actividades.',
      'El formulario de registro de labores ahora funciona de manera dual (registro y actualización).',
      'Alertas de confirmación añadidas antes de eliminar cualquier labor para evitar pérdidas accidentales de datos.'
    ]
  },
  {
    version: '1.5.0',
    date: '27 de Abril, 2026',
    title: 'Edición y Gestión de Trabajadores',
    description: 'Añadida la capacidad de editar la información de los trabajadores registrados. Corrección de referencias de estado y mejoras visuales en las tarjetas de perfil.',
    type: 'feature',
    changes: [
      'Habilitada edición de nombres, cargos, cédulas y salarios/jornales desde un modal interactivo.',
      'Optimización de la eliminación lógica de perfiles protegiendo la integridad histórica de sus jornadas laborales pasadas.',
      'Soporte visual refinado y botones de control contextuales en cada tarjeta de perfil.'
    ]
  },
  {
    version: '1.4.0',
    date: '27 de Abril, 2026',
    title: 'Liquidación Quincenal de Nómina',
    description: 'Implementación del motor automatizado de liquidación de nóminas quincenales para jornaleros y personal de la finca.',
    type: 'feature',
    changes: [
      'Detección inteligente de la quincena actual (Q1: 1-15, Q2: 16-fin de mes) en base a la fecha del sistema.',
      'Agrupación automática en tiempo real de jornales pendientes y cálculo de devengados individuales.',
      'Generación de nómina automatizada con un clic y persistencia del registro en la colección de liquidaciones.'
    ]
  },
  {
    version: '1.3.0',
    date: '25 de Abril, 2026',
    title: 'Registro Digital de Jornales',
    description: 'Integración del sistema transaccional de asistencia y jornadas diarias trabajadas.',
    type: 'feature',
    changes: [
      'Formulario dinámico enlazado con la base de datos de trabajadores activos.',
      'Cálculo automático del total devengado en base al valor unitario del jornal registrado.',
      'Tabla cronológica en tiempo real con soporte de eliminación inmediata y sincronización multi-sesión.'
    ]
  },
  {
    version: '1.2.0',
    date: '25 de Abril, 2026',
    title: 'Módulo de Personal y Trabajadores',
    description: 'Lanzamiento del módulo de administración de personal de la Finca La Dalia.',
    type: 'feature',
    changes: [
      'Registro completo de nuevos trabajadores (Nombre, Cédula, Cargo, Salario/Jornal).',
      'Tarjetas de perfil de trabajadores dinámicas en tiempo real con indicador de estado (activo/inactivo).',
      'Integración con la colección de trabajadores de Firestore.'
    ]
  },
  {
    version: '1.1.0',
    date: '23 de Abril, 2026',
    title: 'Integración Real-Time de Producción',
    description: 'Enlace del Dashboard con los datos en tiempo real de cosechas, ventas y actividades de mantenimiento.',
    type: 'feature',
    changes: [
      'Kilos producidos totales mostrados dinámicamente en el dashboard principal.',
      'Línea de tiempo lateral (timeline) unificada reflejando cosechas y mantenimiento al instante.',
      'Sincronización robusta entre sesiones asegurando confiabilidad y persistencia de información.'
    ]
  },
  {
    version: '1.0.0',
    date: '22 de Abril, 2026',
    title: 'Lanzamiento Inicial (Optifrutas)',
    description: 'Estructuración inicial de la plataforma de administración digital Finca La Dalia.',
    type: 'feature',
    changes: [
      'Diseño visual premium con paleta de colores HSL verde y gris de alta gama.',
      'Pestañas de inventario, lotes e historial estructuradas.',
      'Implementación de autenticación de usuario inicial y base de configuración de Firebase.'
    ]
  }
];
