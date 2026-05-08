#!/usr/bin/env python3
"""Update task README content, featured examples, and final overview images."""

from __future__ import annotations

import base64
import json
import os
import shutil
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parent
TASKS_ROOT = REPO_ROOT / "tasks"
TASKS_DB = ROOT / "public" / "data" / "tasks_db.json"
FINAL_DIR = ROOT / "public" / "images" / "final"
GITHUB_CONTENTS = "https://api.github.com/repos/HeSunPU/imaging-101/contents/tasks"


FEATURED_EXAMPLES = [
    {
        "domain": "A",
        "task_name": "eht_black_hole_original",
        "classic_reason": (
            "Chosen for Astronomy because static EHT black-hole imaging is the "
            "canonical VLBI imaging problem behind the first M87* result; closure "
            "phase/amplitude reconstruction is a standard baseline in the EHT literature."
        ),
    },
    {
        "domain": "B",
        "task_name": "fourier_ptychography",
        "classic_reason": (
            "Chosen for Biology/Microscopy because Fourier ptychographic microscopy "
            "is a widely used computational microscopy baseline for phase retrieval, "
            "synthetic-aperture resolution enhancement, and wide-field reconstruction."
        ),
    },
    {
        "domain": "C",
        "task_name": "conventional_ptychography",
        "classic_reason": (
            "Chosen for Physics/Optics because conventional ptychography is a "
            "foundational coherent diffraction imaging task: recover a complex object "
            "from overlapping diffraction patterns using iterative phase retrieval."
        ),
    },
    {
        "domain": "D",
        "task_name": "mcr_hyperspectral",
        "classic_reason": (
            "Chosen for Chemistry/Materials because MCR-ALS hyperspectral unmixing "
            "is the classic chemometrics baseline for separating concentration maps "
            "and spectra from mixed spectral image cubes."
        ),
    },
    {
        "domain": "E",
        "task_name": "seismic_FWI_original",
        "classic_reason": (
            "Chosen for Earth Science because seismic full-waveform inversion is a "
            "representative geophysical imaging inverse problem that reconstructs a "
            "subsurface velocity model from wavefield measurements."
        ),
    },
    {
        "domain": "F",
        "task_name": "mri_sense",
        "classic_reason": (
            "Chosen for Medicine because SENSE is one of the foundational MRI "
            "parallel-imaging baselines, directly reconstructing an image from "
            "undersampled multi-coil k-space and coil sensitivity maps."
        ),
    },
]


IMAGE_SELECTIONS: dict[str, dict[str, Any]] = {
    "eht_black_hole_original": {
        "source": "public/images/nb/eht_black_hole_original_4.png",
        "grid": (2, 3, 0, 2),
        "note": "Notebook cell 16, closure-only calibrated EHT reconstruction panel.",
    },
    "eht_black_hole_dynamic": {
        "source": "public/images/nb/eht_black_hole_dynamic_6.png",
        "grid": (3, 5, 2, 2),
        "note": "Notebook cell 20, StarWarps reconstructed middle frame.",
    },
    "eht_black_hole_UQ": {
        "source": "public/images/nb/eht_black_hole_UQ_2.png",
        "grid": (1, 7, 0, 1),
        "note": "Notebook cell 11, DPI posterior mean reconstruction panel.",
    },
    "eht_black_hole_feature_extraction_dynamic": {
        "source": "public/images/nb/eht_black_hole_feature_extraction_dynamic_3.png",
        "grid": (2, 10, 0, 5),
        "note": "Notebook cell 13, posterior-mean image at a representative time frame.",
    },
    "eht_black_hole_tomography": {
        "source": "public/images/nb/eht_black_hole_tomography_3.png",
        "grid": (2, 6, 1, 2),
        "note": "Notebook cell 12, estimated 3D emission rendering from one view.",
    },
    "lucky_imaging": {
        "source": "public/images/nb/lucky_imaging_5.png",
        "grid": (2, 2, 1, 1),
        "note": "Notebook cell 17, final lucky stack with unsharp masking.",
    },
    "exoplanet_imaging": {
        "source": "public/images/nb/exoplanet_imaging_4.png",
        "grid": (1, 3, 0, 1),
        "note": "Notebook cell 13, KLIP-ADI detection map at K=10.",
    },
    "shack-hartmann": {
        "source": "public/images/nb/shack-hartmann_4.png",
        "grid": (4, 3, 2, 1),
        "note": "Notebook cell 18, reconstructed wavefront phase map at a representative WFE level.",
    },
    "shapelet_source_reconstruction": {
        "source": "../tasks/shapelet_source_reconstruction/evaluation/reference_outputs/fig3_source_reconstruction.png",
        "grid": (2, 3, 1, 1),
        "note": "Notebook section 3 / reference output fig3, reconstructed source panel.",
    },
    "SSNP_ODT": {
        "source": "public/images/nb/SSNP_ODT_4.png",
        "grid": (1, 3, 0, 1),
        "note": "Notebook cell 11, center-slice SSNP-ODT reconstruction panel.",
    },
    "reflection_ODT": {
        "source": "public/images/nb/reflection_ODT_3.png",
        "grid": (1, 4, 0, 2),
        "note": "Notebook cell 11, reconstructed refractive-index slice.",
    },
    "fourier_ptychography": {
        "source": "public/images/nb/fourier_ptychography_3.png",
        "grid": (2, 3, 0, 2),
        "note": "Notebook cell 11, reconstructed complex object encoded as HSV.",
    },
    "microscope_denoising": {
        "source": "public/images/nb/microscope_denoising_3.png",
        "grid": (1, 4, 0, 3),
        "note": "Notebook cell 13, final two-stage restored microscopy image.",
    },
    "hessian_sim": {
        "source": "public/images/tasks/hessian_sim.png",
        "grid": (2, 5, 0, 3),
        "note": "Notebook cell 13 / task image, Hessian-SIM reconstruction panel.",
    },
    "light_field_microscope": {
        "source": "public/images/nb/light_field_microscope_2.png",
        "grid": (2, 6, 1, 3),
        "note": "Notebook cell 10, reconstructed axial slice from the volume demo.",
    },
    "single_molecule_light_field": {
        "source": "public/images/nb/single_molecule_light_field_6.png",
        "note": "Notebook cell 19, final 2D super-resolution XY localization projection.",
    },
    "fpm_inr_reconstruction": {
        "source": "public/images/tasks/fpm_inr_reconstruction.png",
        "grid": (1, 3, 0, 1),
        "note": "Notebook cell 14 / task image, FPM-INR all-in-focus reconstruction panel.",
    },
    "s2ism": {
        "source": "public/images/tasks/s2ism.png",
        "grid": (1, 3, 0, 2),
        "note": "Notebook cell 16 / task image, s2ISM reconstruction panel.",
    },
    "conventional_ptychography": {
        "source": "public/images/nb/conventional_ptychography_3.png",
        "grid": (2, 4, 0, 2),
        "note": "Notebook cell 11, reconstructed complex object encoded as HSV.",
    },
    "spectral_snapshot_compressive_imaging": {
        "source": "public/images/nb/spectral_snapshot_compressive_imaging_5.png",
        "grid": (1, 3, 0, 1),
        "note": "Notebook cell 14, reconstructed pseudo-RGB hyperspectral image panel.",
    },
    "electron_ptychography": {
        "source": "public/images/nb/electron_ptychography_3.png",
        "grid": (1, 2, 0, 0),
        "note": "Notebook cell 13, reconstructed object phase panel.",
    },
    "confocal-nlos-fk": {
        "source": "public/images/nb/confocal-nlos-fk_1.png",
        "grid": (1, 2, 0, 0),
        "note": "Notebook cell 10, f-k NLOS volumetric reconstruction panel.",
    },
    "lensless_imaging": {
        "source": "public/images/nb/lensless_imaging_2.png",
        "grid": (1, 3, 0, 2),
        "note": "Notebook cell 14, ADMM lensless-camera reconstruction panel.",
    },
    "differentiable_deflectometry": {
        "source": "public/images/nb/differentiable_deflectometry_2.png",
        "grid": (2, 1, 0, 0),
        "note": "Notebook cell 10, optimized deflectometry reconstruction for camera 1.",
    },
    "mcr_hyperspectral": {
        "source": "public/images/nb/mcr_hyperspectral_5.png",
        "grid": (6, 3, 1, 1),
        "note": "Notebook cell 20, retrieved concentration-map panel from MCR output.",
    },
    "raman_cell_phenotyping": {
        "source": "public/images/nb/raman_cell_phenotyping_3.png",
        "note": "Notebook cell 14, merged false-color Raman reconstruction.",
    },
    "cars_spectroscopy": {
        "source": "public/images/nb/cars_spectroscopy_1.png",
        "note": "Notebook cell 7, fitted CARS spectrum from the inversion result.",
    },
    "xray_ptychography_tike": {
        "source": "public/images/nb/xray_ptychography_tike_4.png",
        "grid": (1, 2, 0, 0),
        "note": "Notebook cell 17, reconstructed X-ray ptychography object phase.",
    },
    "xray_laminography_tike": {
        "source": "public/images/nb/xray_laminography_tike_2.png",
        "grid": (3, 4, 1, 1),
        "note": "Notebook cell 13, central reconstructed laminography slice.",
    },
    "seismic_FWI_original": {
        "source": "public/images/nb/seismic_FWI_original_4.png",
        "grid": (3, 1, 1, 0),
        "note": "Notebook cell 17, inverted velocity model panel.",
    },
    "seismic_traveltime_tomography": {
        "source": "public/images/nb/seismic_traveltime_tomography_2.png",
        "grid": (2, 2, 1, 0),
        "note": "Notebook cell 12, inverted traveltime-tomography velocity model panel.",
    },
    "seismic_lsrtm_original": {
        "source": "public/images/nb/seismic_lsrtm_original_2.png",
        "note": "Notebook cell 10, final LSRTM scattering-potential image.",
    },
    "insar_phase_unwrapping": {
        "source": "public/images/nb/insar_phase_unwrapping_1.png",
        "grid": (1, 2, 0, 0),
        "note": "Notebook cell 7, SPURS unwrapped-phase reconstruction panel.",
    },
    "weather_radar_data_assimilation": {
        "source": "public/images/nb/weather_radar_data_assimilation_2.png",
        "grid": (4, 6, 3, 4),
        "note": "Notebook cell 12, reconstructed radar nowcast frame.",
    },
    "era5_tensorvar": {
        "source": "public/images/nb/era5_tensorvar_2.png",
        "grid": (10, 5, 0, 2),
        "min_height": 160,
        "note": "Notebook cell 11, Tensor-Var analysed field panel.",
    },
    "ct_fan_beam": {
        "source": "public/images/nb/ct_fan_beam_3.png",
        "grid": (1, 4, 0, 2),
        "note": "Notebook cell 13, TV-PDHG short-scan CT reconstruction panel.",
    },
    "ct_sparse_view": {
        "source": "public/images/nb/ct_sparse_view_2.png",
        "grid": (1, 4, 0, 2),
        "note": "Notebook cell 9, TV-PDHG sparse-view CT reconstruction panel.",
    },
    "ct_poisson_lowdose": {
        "source": "public/images/nb/ct_poisson_lowdose_2.png",
        "grid": (1, 3, 0, 2),
        "note": "Notebook cell 7, PWLS low-dose CT reconstruction panel.",
    },
    "ct_dual_energy": {
        "source": "public/images/nb/ct_dual_energy_4.png",
        "grid": (2, 3, 0, 1),
        "note": "Notebook cell 16, estimated tissue density map panel.",
    },
    "xray_tooth_gridrec": {
        "source": "public/images/nb/xray_tooth_gridrec_1.png",
        "grid": (1, 3, 0, 2),
        "note": "Notebook cell 9, Gridrec tooth-CT reconstruction panel.",
    },
    "mri_l1_wavelet": {
        "source": "public/images/nb/mri_l1_wavelet_0.png",
        "grid": (1, 4, 0, 3),
        "note": "Notebook cell 7, L1-wavelet MRI reconstruction panel.",
    },
    "mri_tv": {
        "source": "public/images/nb/mri_tv_1.png",
        "grid": (1, 3, 0, 2),
        "note": "Notebook cell 9, TV MRI reconstruction panel.",
    },
    "mri_t2_mapping": {
        "source": "public/images/nb/mri_t2_mapping_3.png",
        "grid": (1, 3, 0, 1),
        "note": "Notebook cell 13, nonlinear least-squares T2 map panel.",
    },
    "mri_sense": {
        "source": "public/images/nb/mri_sense_2.png",
        "grid": (1, 3, 0, 2),
        "note": "Notebook cell 9, CG-SENSE MRI reconstruction panel.",
    },
    "mri_grappa": {
        "source": "public/images/nb/mri_grappa_1.png",
        "grid": (1, 3, 0, 2),
        "note": "Notebook cell 7, GRAPPA MRI reconstruction panel.",
    },
    "mri_noncartesian_cs": {
        "source": "public/images/nb/mri_noncartesian_cs_1.png",
        "grid": (1, 3, 0, 2),
        "note": "Notebook cell 9, L1-wavelet non-Cartesian MRI reconstruction panel.",
    },
    "diffusion_mri_dti": {
        "source": "public/images/nb/diffusion_mri_dti_3.png",
        "note": "Notebook cell 13, directional color FA reconstruction map.",
    },
    "mri_dynamic_dce": {
        "source": "public/images/nb/mri_dynamic_dce_2.png",
        "grid": (3, 5, 2, 2),
        "note": "Notebook cell 9, temporal-TV reconstructed DCE-MRI frame.",
    },
    "mri_pnp_admm": {
        "source": "public/images/nb/mri_pnp_admm_1.png",
        "grid": (1, 3, 0, 2),
        "note": "Notebook cell 7, PnP-ADMM MRI reconstruction panel.",
    },
    "mri_varnet": {
        "source": "public/images/nb/mri_varnet_0.png",
        "grid": (1, 3, 0, 2),
        "note": "Notebook cell 5, VarNet MRI reconstruction panel.",
    },
    "pnp_mri_reconstruction": {
        "source": "public/images/nb/pnp_mri_reconstruction_5.png",
        "grid": (1, 3, 0, 2),
        "note": "Notebook cell 17, PnP-MSSN MRI reconstruction panel.",
    },
    "plane_wave_ultrasound": {
        "source": "public/images/nb/plane_wave_ultrasound_2.png",
        "grid": (1, 2, 0, 0),
        "note": "Notebook cell 10, F-K migrated plane-wave ultrasound reconstruction panel.",
    },
    "ultrasound_sos_tomography": {
        "source": "public/images/nb/ultrasound_sos_tomography_2.png",
        "grid": (2, 4, 0, 3),
        "note": "Notebook cell 9, TV-PDHG speed-of-sound reconstruction panel.",
    },
    "usct_FWI": {
        "source": "public/images/nb/usct_FWI_3.png",
        "grid": (1, 3, 0, 1),
        "note": "Notebook cell 8, final multi-frequency USCT-FWI reconstruction panel.",
    },
    "pet_mlem": {
        "source": "public/images/nb/pet_mlem_2.png",
        "grid": (1, 4, 0, 1),
        "note": "Notebook cell 11, MLEM PET reconstruction panel.",
    },
    "photoacoustic_tomography": {
        "source": "public/images/nb/photoacoustic_tomography_2.png",
        "grid": (1, 3, 0, 2),
        "note": "Notebook cell 11, UBP photoacoustic reconstruction panel.",
    },
    "eit_conductivity_reconstruction": {
        "source": "public/images/nb/eit_conductivity_reconstruction_3.png",
        "grid": (1, 2, 0, 1),
        "note": "Notebook cell 14, JAC dynamic EIT reconstruction panel.",
    },
}


def resolve_source(source: str) -> Path:
    path = Path(source)
    if path.is_absolute():
        return path
    if source.startswith("../"):
        return (ROOT / path).resolve()
    return ROOT / path


def crop_grid(image: Image.Image, grid: tuple[int, int, int, int]) -> Image.Image:
    rows, cols, row, col = grid
    width, height = image.size
    left = round(width * col / cols)
    right = round(width * (col + 1) / cols)
    top = round(height * row / rows)
    bottom = round(height * (row + 1) / rows)

    # Keep most of the panel while trimming boundaries that may include neighbors.
    margin_x = max(2, round((right - left) * 0.035))
    margin_y = max(2, round((bottom - top) * 0.035))
    left += margin_x
    right -= margin_x
    top += margin_y
    bottom -= margin_y
    return image.crop((left, top, right, bottom))


def upscale_to_min_size(image: Image.Image, min_width: int = 0, min_height: int = 0) -> Image.Image:
    width, height = image.size
    scale = max(
        min_width / width if min_width else 1,
        min_height / height if min_height else 1,
    )
    if scale <= 1:
        return image
    return image.resize((round(width * scale), round(height * scale)), Image.Resampling.LANCZOS)


def ensure_png(task_name: str, selection: dict[str, Any]) -> dict[str, str]:
    source_path = resolve_source(selection["source"])
    if not source_path.exists():
        raise FileNotFoundError(f"{task_name}: source image not found: {source_path}")

    FINAL_DIR.mkdir(parents=True, exist_ok=True)
    out_path = FINAL_DIR / f"{task_name}.png"

    with Image.open(source_path) as image:
        image = image.convert("RGB")
        if "grid" in selection:
            image = crop_grid(image, selection["grid"])
        image = upscale_to_min_size(
            image,
            min_width=int(selection.get("min_width", 0)),
            min_height=int(selection.get("min_height", 0)),
        )
        image.save(out_path)

    rel = out_path.relative_to(ROOT / "public").as_posix()
    return {
        "path": f"/{rel}",
        "source": selection["note"],
        "source_image": selection["source"].replace("\\", "/"),
    }


def read_task_readme(key: str, task_name: str) -> str:
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if token:
        url = f"{GITHUB_CONTENTS}/{task_name}/README.md?ref=main"
        request = Request(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "User-Agent": "imaging-101-content-updater",
            },
        )
        with urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
        return base64.b64decode(payload["content"]).decode("utf-8").replace("\r\n", "\n")

    readme = TASKS_ROOT / task_name / "README.md"
    if not readme.exists():
        raise FileNotFoundError(f"{key} {task_name}: missing README.md")
    return readme.read_text(encoding="utf-8", errors="ignore").replace("\r\n", "\n")


def main() -> None:
    payload = json.loads(TASKS_DB.read_text(encoding="utf-8"))
    payload["featured_examples"] = FEATURED_EXAMPLES

    for key, task in payload["tasks"].items():
        task_name = task["name"]
        if task_name not in IMAGE_SELECTIONS:
            raise KeyError(f"{key} {task_name}: missing image selection")

        task["readme_markdown"] = read_task_readme(key, task_name)
        task["readme_url"] = (
            "https://github.com/HeSunPU/imaging-101/blob/main/"
            f"tasks/{task_name}/README.md"
        )
        task["overview_image"] = ensure_png(task_name, IMAGE_SELECTIONS[task_name])

    TASKS_DB.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Updated {len(payload['tasks'])} tasks")
    print(f"Wrote final images to {FINAL_DIR}")


if __name__ == "__main__":
    main()
