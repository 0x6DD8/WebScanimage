use actix_web::{get, post, App, HttpResponse, HttpServer, Responder};
use rand::Rng;
use std::process::Command;

//HTTP server port.
const PORT: u16 = 8080;

#[get("/")]
async fn index() -> impl Responder {
    HttpResponse::Ok().body("Nothing yet")
}

#[post("/api/scanimage")]
async fn scanimage(req_body: String) -> impl Responder {
    let mut rng = rand::thread_rng();
    //generate random int for a file name.
    let file_name = rng.gen::<u32>();
    let file_path = "./scans/";
    let res = "300";
    let file_format = "png";

    //Execute scanimage with parameters
    Command::new("sh")
        .arg("-c")
        .arg(format!(
            "scanimage --resolution {resolution} --format={format}>{path}scan_{filename}.{format}",
            resolution = res,
            format = file_format,
            path = file_path,
            filename = file_name
        ))
        .spawn()
        .expect("failed");

    println!("new Image Scanned: scan_{}.{} ", file_name, file_format);
    HttpResponse::Ok().body(req_body)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new()
        .service(index)
        .service(scanimage))
            .bind(("127.0.0.1", PORT))?
            .run()
            .await
}
