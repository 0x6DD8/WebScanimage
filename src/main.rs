use actix_web::{post, App, HttpResponse, HttpServer, Responder};
use rand::Rng;
use serde_json::json;
use std::{process::Command, time::{SystemTime, UNIX_EPOCH}};
use actix_files as fs;

//HTTP server port.
const PORT: u16 = 8080;
const SCANS_PATH: &str = "./scans/";


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
    let mut scanimage_command = Command::new("sh")
        .arg("-c")
        .arg(format!(
            "scanimage --resolution {resolution} --format={format}>{path}{filename}.{format}",
            resolution = res,
            format = file_format,
            path = SCANS_PATH,
            filename = file_name
        ))
        .spawn()
        .unwrap();
    
    scanimage_command.wait().unwrap();

    println!("new Image Scanned: {}.{} ", file_name, file_format);
    

    let response = json!({
        "fileName": file_name,
        "fileFormat": file_format
    });

    HttpResponse::Ok().body(response.to_string())
}

#[post("/api/printimage")]
async fn printimage(req_body: String) -> impl Responder {
    //Parse json to string.
    let formatted_body: serde_json::Value = serde_json::from_str(&req_body).expect("failed to parse json");
    
    let file_format = &formatted_body["format"];
    let file_name = &formatted_body["filename"];

    //Execute lpr with parameters
    let mut lpr_command = Command::new("sh")
        .arg("-c")
        .arg(format!(
            "lpr {path}{filename}.{format}",
            format = file_format,
            path = SCANS_PATH,
            filename = file_name
        ))
        .spawn()
        .unwrap();
    
    lpr_command.wait().unwrap();

    HttpResponse::Ok()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Server Started On Port: {}", PORT);

    //save simple build number to json
    std::fs::write(
        "./static/buildver.json",
        &format!("{{\"buildver\": {}}}", SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs())
    ).unwrap();

    HttpServer::new(|| App::new()
        .service(scanimage)
        .service(printimage)
        .service(fs::Files::new("/scans", SCANS_PATH).show_files_listing())
        .service(fs::Files::new("/", "./static").index_file("index.html")))
            .bind(("0.0.0.0", PORT))?
            .run()
            .await
}
