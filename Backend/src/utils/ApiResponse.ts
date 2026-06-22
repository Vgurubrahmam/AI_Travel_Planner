export class ApiResponse {
  static success(data: any, message = 'Success') {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, error?: any) {
    return {
      success: false,
      message,
      error: error || undefined,
    };
  }
}
