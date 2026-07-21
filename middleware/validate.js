const { body, param, validationResult } = require('express-validator');

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({ error: messages.join('. ') });
  }
  next();
};

const registerRules = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.')
    .matches(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios.'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio.')
    .isEmail().withMessage('Formato de email no válido.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres.')
    .matches(/[A-Z]/).withMessage('La contraseña debe tener al menos una mayúscula.')
    .matches(/[a-z]/).withMessage('La contraseña debe tener al menos una minúscula.')
    .matches(/[0-9]/).withMessage('La contraseña debe tener al menos un número.')
    .matches(/[!@#$%^&*]/).withMessage('La contraseña debe tener al menos un símbolo (!@#$%^&*).'),
  handleErrors,
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio.')
    .isEmail().withMessage('Formato de email no válido.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.'),
  handleErrors,
];

const habitRules = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre del hábito es obligatorio.')
    .isLength({ min: 2, max: 200 }).withMessage('El nombre debe tener entre 2 y 200 caracteres.'),
  body('dificultad')
    .trim()
    .notEmpty().withMessage('La dificultad es obligatoria.')
    .isIn(['FACIL', 'MEDIA', 'DIFICIL']).withMessage('Dificultad no válida. Usa: FACIL, MEDIA o DIFICIL.'),
  body('frecuencia')
    .optional()
    .trim()
    .isIn(['DIARIO', 'SEMANAL', 'MENSUAL']).withMessage('Frecuencia no válida.'),
  handleErrors,
];

const idParamRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.'),
  handleErrors,
];

const shopRules = [
  body('producto')
    .trim()
    .notEmpty().withMessage('El producto es obligatorio.')
    .isLength({ min: 1, max: 200 }).withMessage('El nombre del producto es demasiado largo.'),
  body('costo')
    .notEmpty().withMessage('El costo es obligatorio.')
    .isInt({ min: 1 }).withMessage('El costo debe ser un número entero positivo.'),
  handleErrors,
];

const AVATARS = [
  '🧙‍♂️','🧙‍♀️','🦸‍♂️','🦸‍♀️','🧑‍🚀','🦹‍♂️','🦹‍♀️','🧑‍💻','👨‍🎨','👩‍🎨',
  '🦊','🐱','🐶','🦁','🐯','🐼','🐨','🦄','🐙','🦋',
  '🐲','🐉','🦅','🦉','🐺','🦝','🦌','🐢','🐬','🦈',
  '🤖','👾','👽','🎭','🥷','🧑‍🏭','🧑‍🔬','🧑‍🍳','🧑‍🎓','🧑‍🎤',
  '💀','👻','🎃','🔥','⚡','❄️','🌟','💎','🎲','🎯'
];

const updateProfileRules = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.')
    .matches(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios.'),
  body('avatar')
    .optional()
    .isIn(AVATARS).withMessage('Avatar no válido.'),
  handleErrors,
];

const deleteAccountRules = [
  body('confirmacion')
    .notEmpty().withMessage('La confirmación es obligatoria.')
    .equals('ELIMINAR').withMessage('Escribe ELIMINAR para confirmar.'),
  handleErrors,
];

module.exports = {
  registerRules,
  loginRules,
  habitRules,
  idParamRules,
  shopRules,
  updateProfileRules,
  deleteAccountRules,
};
