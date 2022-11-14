build:
	make clean
	mkdir scans
	cargo build --release
	echo "use 'make run' to start release version"

run:
	chmod +x /target/release/web-scanimage
	./target/release/web-scanimage

clean:
	rm -rf ./scans

debug:
	cargo run