for file in *.m4a; do
  ffmpeg -i "$file" -acodec libmp3lame -q:a 0 "${file%.m4a}.mp3"
done