import { ValidationError } from "express-validator";

export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  };
};

export class HttpValidationError extends Error {
  validationErrors: ValidationError[];

  constructor(message: string, validationErrors: ValidationError[]) {
    super(message);
    this.name = 'HttpValidationError';
    this.validationErrors = validationErrors;
  };
}