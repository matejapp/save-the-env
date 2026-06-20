using Api.Exceptions;

namespace Api.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public GlobalExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (NotFoundException ex)
            {
                await WriteErrorAsync(context, 404, ex.Message);
            }
            catch (ConflictException ex)
            {
                await WriteErrorAsync(context, 409, ex.Message);
            }
            catch (UnauthorizedException ex)
            {
                await WriteErrorAsync(context, 401, ex.Message);
            }
            catch (ForbiddenException ex)
            {
                await WriteErrorAsync(context, 403, ex.Message);
            }
            catch (ValidationException ex)
            {
                await WriteErrorAsync(context, 400, ex.Message);
            }
            catch (Exception)
            {
                await WriteErrorAsync(context, 500, "An unexpected error occurred.");
            }
        }

        private static async Task WriteErrorAsync(HttpContext context, int statusCode, string message)
        {
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { error = message });
        }
    }
}
