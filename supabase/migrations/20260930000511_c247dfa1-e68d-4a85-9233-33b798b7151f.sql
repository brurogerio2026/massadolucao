ALTER TABLE public.products
  ALTER COLUMN package_width_cm DROP NOT NULL,
  ALTER COLUMN package_width_cm DROP DEFAULT,
  ALTER COLUMN package_height_cm DROP NOT NULL,
  ALTER COLUMN package_height_cm DROP DEFAULT,
  ALTER COLUMN package_length_cm DROP NOT NULL,
  ALTER COLUMN package_length_cm DROP DEFAULT;

UPDATE public.products
SET package_width_cm = NULL,
    package_height_cm = NULL,
    package_length_cm = NULL
WHERE package_width_cm = 11
  AND package_height_cm = 2
  AND package_length_cm = 16;