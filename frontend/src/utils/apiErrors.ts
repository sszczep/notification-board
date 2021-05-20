export interface BaseError {
  name: string;
  message: string;
};

export interface HttpError extends BaseError {};

export interface HttpValidationError extends HttpError {
  validationErrors: Array<{
    msg: string;
    param: string;
    value?: string;
  }>;
}