const winston = require('winston')

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({stack: true}),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: {service: 'identity-service'},
    transports: [
        new winston.transports.Console({    
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({filename: 'error.log', level: 'error'}),
        new winston.transports.File({filename: 'combined.log'})
    ]
})
//Development: colorful, readable console logs.
// Production: clean JSON logs for file-based logging & monitoring tools.
//Structured logs: timestamped, stack-trace-aware, metadata-enabled.

module.exports = logger