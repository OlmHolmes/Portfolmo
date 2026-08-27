#!/usr/bin/env bash
set -euo pipefail

SRC="/Users/olmo/Desktop/portfolio"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="$SCRIPT_DIR/../public/projects"

mkdir -p "$DEST"/cyberstalking "$DEST"/agrabah "$DEST"/hines "$DEST"/lift-to-feel \
  "$DEST"/x-triennale "$DEST"/polly-peck "$DEST"/amor-sanguinis "$DEST"/data-footprint \
  "$DEST"/ultrasynesthesia "$DEST"/forse-sto-bruciando "$DEST"/distopia-cronica \
  "$DEST"/exploring-villa-restelli

# cyberstalking
cp "$SRC/Cyberstalking/1_cover.jpeg" "$DEST/cyberstalking/cyberstalking-cover.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_01.jpeg" "$DEST/cyberstalking/cyberstalking-01.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_02.jpeg .jpeg" "$DEST/cyberstalking/cyberstalking-02.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_03.mp4" "$DEST/cyberstalking/cyberstalking-03.mp4"
cp "$SRC/Cyberstalking/cyberstalking_04_statico.jpeg" "$DEST/cyberstalking/cyberstalking-04-statico.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_04_animato.mp4" "$DEST/cyberstalking/cyberstalking-04-animato.mp4"
cp "$SRC/Cyberstalking/cyberstalking_05.jpeg" "$DEST/cyberstalking/cyberstalking-05.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_06.jpeg" "$DEST/cyberstalking/cyberstalking-06.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_07.jpeg" "$DEST/cyberstalking/cyberstalking-07.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_08.jpeg" "$DEST/cyberstalking/cyberstalking-08.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_09.jpeg" "$DEST/cyberstalking/cyberstalking-09.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_10.mp4" "$DEST/cyberstalking/cyberstalking-10.mp4"
cp "$SRC/Cyberstalking/cyberstalking_12.jpeg" "$DEST/cyberstalking/cyberstalking-12.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_13.jpeg" "$DEST/cyberstalking/cyberstalking-13.jpeg"

# agrabah
cp "$SRC/Agrabah/1_cover.jpeg" "$DEST/agrabah/agrabah-cover.jpeg"
cp "$SRC/Agrabah/agrabah_02.jpeg" "$DEST/agrabah/agrabah-02.jpeg"
cp "$SRC/Agrabah/agrabah_03.png" "$DEST/agrabah/agrabah-03.png"
cp "$SRC/Agrabah/agrabah_04.jpeg" "$DEST/agrabah/agrabah-04.jpeg"
cp "$SRC/Agrabah/agrabah_06.png" "$DEST/agrabah/agrabah-06.png"
cp "$SRC/Agrabah/agrabah_07.png" "$DEST/agrabah/agrabah-07.png"
cp "$SRC/Agrabah/agrabah_08.jpeg" "$DEST/agrabah/agrabah-08.jpeg"
cp "$SRC/Agrabah/agrabah_09.png" "$DEST/agrabah/agrabah-09.png"
cp "$SRC/Agrabah/agrabah_10.png" "$DEST/agrabah/agrabah-10.png"
cp "$SRC/Agrabah/AGRABAH_negativo_upscale.png" "$DEST/agrabah/agrabah-11.png"
cp "$SRC/Agrabah/ventagli-01.png" "$DEST/agrabah/agrabah-12.png"
cp "$SRC/Agrabah/ventagli-02.png" "$DEST/agrabah/agrabah-13.png"
cp "$SRC/Agrabah/Motion_Agrabah.mp4" "$DEST/agrabah/agrabah-motion.mp4"

# hines
cp "$SRC/Hines/1_cover.png" "$DEST/hines/hines-cover.png"
cp "$SRC/Hines/hines_01.jpeg" "$DEST/hines/hines-01.jpeg"
cp "$SRC/Hines/hines_02.jpeg" "$DEST/hines/hines-02.jpeg"
cp "$SRC/Hines/hines_03.jpeg" "$DEST/hines/hines-03.jpeg"
cp "$SRC/Hines/hines_04.jpeg" "$DEST/hines/hines-04.jpeg"
cp "$SRC/Hines/hines_06.jpeg" "$DEST/hines/hines-06.jpeg"
cp "$SRC/Hines/hines_07.jpeg" "$DEST/hines/hines-07.jpeg"
cp "$SRC/Hines/hines_08.jpeg" "$DEST/hines/hines-08.jpeg"

# lift-to-feel (source folder has a trailing space: "Lift to Feel ")
cp "$SRC/Lift to Feel /1_cover.jpeg" "$DEST/lift-to-feel/lift-to-feel-cover.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_02.jpeg" "$DEST/lift-to-feel/lift-to-feel-02.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_03.jpeg" "$DEST/lift-to-feel/lift-to-feel-03.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_04.jpeg" "$DEST/lift-to-feel/lift-to-feel-04.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_05.jpeg" "$DEST/lift-to-feel/lift-to-feel-05.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_06.jpeg" "$DEST/lift-to-feel/lift-to-feel-06.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_07.jpeg" "$DEST/lift-to-feel/lift-to-feel-07.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_08.jpeg" "$DEST/lift-to-feel/lift-to-feel-08.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_09.jpeg" "$DEST/lift-to-feel/lift-to-feel-09.jpeg"

# x-triennale
cp "$SRC/X Triennale/1_cover.jpeg" "$DEST/x-triennale/x-triennale-cover.jpeg"
cp "$SRC/X Triennale/xtriennale_02.jpeg" "$DEST/x-triennale/x-triennale-02.jpeg"
cp "$SRC/X Triennale/xtriennale_03.jpeg" "$DEST/x-triennale/x-triennale-03.jpeg"
cp "$SRC/X Triennale/xtriennale_04.jpeg" "$DEST/x-triennale/x-triennale-04.jpeg"
cp "$SRC/X Triennale/xtriennale_05.jpeg" "$DEST/x-triennale/x-triennale-05.jpeg"

# polly-peck
cp "$SRC/Polly Peck/1_cover.jpeg" "$DEST/polly-peck/polly-peck-cover.jpeg"
cp "$SRC/Polly Peck/pollypeck_02.jpeg" "$DEST/polly-peck/polly-peck-02.jpeg"
cp "$SRC/Polly Peck/pollypeck_03.jpeg" "$DEST/polly-peck/polly-peck-03.jpeg"
cp "$SRC/Polly Peck/pollypeck_04.jpeg" "$DEST/polly-peck/polly-peck-04.jpeg"
cp "$SRC/Polly Peck/pollypeck_05.jpeg" "$DEST/polly-peck/polly-peck-05.jpeg"

# amor-sanguinis (source folder name pending Francesco's confirmation, see note above)
cp "$SRC/output pecoranera/Foto.png" "$DEST/amor-sanguinis/amor-sanguinis-cover.png"
cp "$SRC/output pecoranera/video_hq.mp4" "$DEST/amor-sanguinis/amor-sanguinis-01.mp4"

# data-footprint
cp "$SRC/Data Footprint/Screenshot 2026-07-29 alle 19.21.39.png" "$DEST/data-footprint/data-footprint-cover.png"
cp "$SRC/Data Footprint/Portfolio.mp4" "$DEST/data-footprint/data-footprint-01.mp4"

# ultrasynesthesia
cp "$SRC/Ultrasynesthesia/IMG_20260602_142415398.jpg" "$DEST/ultrasynesthesia/ultrasynesthesia-cover.jpg"
cp "$SRC/Ultrasynesthesia/ultratechno.mp4" "$DEST/ultrasynesthesia/ultrasynesthesia-01.mp4"
if command -v ffmpeg >/dev/null 2>&1; then
  ffmpeg -y -i "$SRC/Ultrasynesthesia/IMG_2026.MOV" -c:v libx264 -c:a aac "$DEST/ultrasynesthesia/ultrasynesthesia-02.mp4"
else
  cp "$SRC/Ultrasynesthesia/IMG_2026.MOV" "$DEST/ultrasynesthesia/ultrasynesthesia-02.mov"
fi

# forse-sto-bruciando (source folder has two trailing spaces: "Forse Sto Bruciando  ")
if command -v ffmpeg >/dev/null 2>&1; then
  ffmpeg -y -i "$SRC/Forse Sto Bruciando  /IMG_9214.MOV" -c:v libx264 -c:a aac "$DEST/forse-sto-bruciando/forse-sto-bruciando-01.mp4"
else
  cp "$SRC/Forse Sto Bruciando  /IMG_9214.MOV" "$DEST/forse-sto-bruciando/forse-sto-bruciando-01.mov"
fi

# distopia-cronica (source folder name pending Francesco's confirmation, see note above)
cp "$SRC/Welcome To Distopia/Comp 1.mp4" "$DEST/distopia-cronica/distopia-cronica-01.mp4"

# exploring-villa-restelli
cp "$SRC/Exploring Villa Restelli/VillaRestelli1.0.mp4" "$DEST/exploring-villa-restelli/exploring-villa-restelli-01.mp4"

echo "Media copy complete."
