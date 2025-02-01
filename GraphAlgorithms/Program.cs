using GraphAlgorithms.Models;
using Microsoft.EntityFrameworkCore;
using System.Xml.Linq;

namespace GraphAlgorithms
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllersWithViews()
               .AddNewtonsoftJson(options =>
               {
                   options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
               });
            var host = Environment.GetEnvironmentVariable("PGHOST");
            var port = Environment.GetEnvironmentVariable("PGPORT");
            var database = Environment.GetEnvironmentVariable("PGDATABASE");
            var username = Environment.GetEnvironmentVariable("PGUSER");
            var password = Environment.GetEnvironmentVariable("PGPASSWORD");
            string connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password};";
            builder.Services.AddDbContext<ProblemDbContext>(options => options.UseNpgsql(connectionString));
            builder.Services.AddScoped<IProblemRepository, ProblemRepository>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ProblemDbContext>();
                db.Database.Migrate();
            }

            app.Run();
        }
    }
}
