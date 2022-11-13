use actix_web::{get, post, App, HttpResponse, HttpServer, Responder};
use rand::Rng;
use serde_json::json;
use std::process::Command;

//HTTP server port.
const PORT: u16 = 8080;
const SCANS_PATH: &str = "./scans/";

#[get("/")]
async fn index() -> impl Responder {
    HttpResponse::Ok().body("Nothing yet")
}

#[post("/api/scanimage")]
async fn scanimage(req_body: String) -> impl Responder {
    //Parse json to string.
    let formatted_body: serde_json::Value = serde_json::from_str(&req_body).expect("failed to parse json");
    
    let mut rng = rand::thread_rng();
    //generate random int for a file name.
    let generated_num = rng.gen::<u32>();
    let res = &formatted_body["resolution"];
    let file_format = &formatted_body["format"];
    let file_name = format!("scan_{}", generated_num);


    //Execute scanimage with parameters
    Command::new("sh")
        .arg("-c")
        .arg(format!(
            "scanimage --resolution {resolution} --format={format}>{path}{filename}.{format}",
            resolution = res,
            format = file_format,
            path = SCANS_PATH,
            filename = file_name
        ))
        .spawn()
        .expect("failed to scan image");

    println!("new Image Scanned: scan_{}.{} ", file_name, file_format);
    

    let response = json!({
        "fileName": file_name,
        "fileFormat": file_format
    });

    HttpResponse::Ok().body(response.to_string())
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
