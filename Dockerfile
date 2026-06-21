FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Api/Api.csproj Api/
RUN dotnet restore Api/Api.csproj

COPY Api/ Api/
RUN dotnet publish Api/Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

CMD ["sh", "-c", "exec dotnet Api.dll --urls http://+:${PORT:-8080}"]
