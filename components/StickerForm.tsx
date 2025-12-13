"use client";
import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import {
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	FormHelperText,
	CircularProgress,
	Alert,
	Button,
} from "@mui/material";
import { motion } from "framer-motion";
import { useCart } from "@/src/context/CartContext";
import Loading from "@/app/loading";
import { Save, CheckCircle, Warning, Info, Refresh } from "@mui/icons-material";
import Skeleton from "@mui/material/Skeleton";
import { AlertTitle } from "@mui/material";
import { StickerFormSkeleton } from "./skeletons/HomeSkeletons";

interface StickerFormProps {
	cartItemId?: number;
	productId: number;
	productData?: any;
	cartItemData?: any;
	onOptionsChange?: (options: any) => void;
	ref?: any;

	showValidation?: boolean;
}

interface SelectedOptions {
	size: string;
	color: string;
	material: string;
	features: { [key: string]: string };
	isValid: boolean;
}

const StickerForm = forwardRef(({
	cartItemId,
	productId,
	cartItemData,
	onOptionsChange,
	showValidation = false, // ✅ NEW default false
}: StickerFormProps, ref) => {
	const { updateCartItem, fetchCartItemOptions } = useCart();

	const [size, setSize] = useState("اختر");
	const [color, setColor] = useState("اختر");
	const [material, setMaterial] = useState("اختر");
	const [selectedFeatures, setSelectedFeatures] = useState<{
		[key: string]: string;
	}>({});

	const [apiData, setApiData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [initialized, setInitialized] = useState(false);
	const [formLoading, setFormLoading] = useState(true);
	const [showSaveButton, setShowSaveButton] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [savedSuccessfully, setSavedSuccessfully] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);
	const [saveError, setSaveError] = useState<string | null>(null);

	const baseUrl = process.env.NEXT_PUBLIC_API_URL;

	useImperativeHandle(ref, () => ({
		getOptions: () => {
			return {
				size,
				color,
				material,
				features: selectedFeatures,
				isValid: validateCurrentOptions()
			};
		},
		validate: () => validateCurrentOptions(),
		saveOptions: () => saveAllOptions(),
		resetOptions: () => resetAllOptions()
	}));

	const validateCurrentOptions = useCallback(() => {
		if (!apiData) return false;

		let isValid = true;

		if (apiData.sizes?.length > 0 && (!size || size === "اختر")) {
			isValid = false;
		}

		if (apiData.colors?.length > 0 && (!color || color === "اختر")) {
			isValid = false;
		}

		if (apiData.materials?.length > 0 && (!material || material === "اختر")) {
			isValid = false;
		}

		if (apiData.features?.length > 0) {
			apiData.features.forEach((feature: any) => {
				const hasValues = feature.value || (feature.values && feature.values.length > 0);
				if (hasValues) {
					const featureValue = selectedFeatures[feature.name];
					if (!featureValue || featureValue === "اختر") {
						isValid = false;
					}
				}
			});
		}

		return isValid;
	}, [apiData, size, color, material, selectedFeatures]);

	useEffect(() => {
		if (onOptionsChange) {
			const options = {
				size,
				color,
				material,
				features: selectedFeatures,
				isValid: validateCurrentOptions()
			};
			onOptionsChange(options);
		}
	}, [size, color, material, selectedFeatures, validateCurrentOptions, onOptionsChange]);

	useEffect(() => {
		const fetchData = async () => {
			setApiError(null);
			try {
				const res = await fetch(`${baseUrl}/products/${productId}`);
				if (!res.ok) throw new Error("فشل تحميل خيارات المنتج");

				const data = await res.json();
				if (!data?.data) throw new Error("لا توجد بيانات للمنتج");

				setApiData(data.data);

				if (data.data?.features) {
					const initialFeatures: { [key: string]: string } = {};
					data.data.features.forEach((feature: any) => {
						const hasValues =
							feature.value || (feature.values && feature.values.length > 0);
						if (hasValues) initialFeatures[feature.name] = "اختر";
					});
					setSelectedFeatures(initialFeatures);
				}
			} catch (err: any) {
				console.error("API Error:", err);
				setApiError(err?.message || "حدث خطأ أثناء تحميل الخيارات");
				setApiData(null);
			} finally {
				setLoading(false);
				setFormLoading(false); // ✅ مهم: علشان skeleton يقفل
			}
		};

		fetchData();
	}, [productId, baseUrl]);


	const extractValueFromOptions = useCallback((options: any[], optionName: string) => {
		if (!options || !Array.isArray(options)) return null;

		const option = options.find((opt: any) => opt.option_name === optionName);
		return option ? option.option_value : null;
	}, []);

	const loadSavedOptions = useCallback(async () => {
		if (!cartItemId) return;

		setFormLoading(true);
		try {
			const savedOptions = await fetchCartItemOptions(cartItemId);

			if (savedOptions) {
				const sizeFromOptions = extractValueFromOptions(savedOptions.selected_options, "المقاس");
				const colorFromOptions = extractValueFromOptions(savedOptions.selected_options, "اللون");
				const materialFromOptions = extractValueFromOptions(savedOptions.selected_options, "الخامة");

				const finalSize = sizeFromOptions || savedOptions.size || "اختر";
				const finalColor = colorFromOptions || (savedOptions.color?.name || savedOptions.color) || "اختر";
				const finalMaterial = materialFromOptions || savedOptions.material || "اختر";

				if (finalSize !== "اختر") setSize(finalSize);
				if (finalColor !== "اختر") setColor(finalColor);
				if (finalMaterial !== "اختر") setMaterial(finalMaterial);

				const featuresFromOptions: { [key: string]: string } = {};
				if (savedOptions.selected_options && savedOptions.selected_options.length > 0) {
					savedOptions.selected_options.forEach((opt: any) => {
						if (opt.option_name === "خاصية") {
							const [name, value] = opt.option_value.split(": ");
							if (name && value && value !== "اختر") {
								featuresFromOptions[name.trim()] = value.trim();
							}
						}
					});
				}

				if (apiData?.features) {
					apiData.features.forEach((feature: any) => {
						const hasValues = feature.value || (feature.values && feature.values.length > 0);
						if (hasValues && !featuresFromOptions[feature.name]) {
							featuresFromOptions[feature.name] = "اختر";
						}
					});
				}

				setSelectedFeatures(featuresFromOptions);
				setHasUnsavedChanges(false);
				setShowSaveButton(false);
			}
		} catch (err) {
			console.error("Error loading saved options:", err);
		} finally {
			setFormLoading(false);
			setInitialized(true);
		}
	}, [cartItemId, fetchCartItemOptions, extractValueFromOptions, apiData]);

	useEffect(() => {
		if (!cartItemId || !apiData) return;
		loadSavedOptions();
	}, [cartItemId, apiData, loadSavedOptions]);

	const saveAllOptions = async () => {
		if (!cartItemId || !apiData) return;

		setSaving(true);
		setSavedSuccessfully(false);

		const selectedOptions: any[] = [];

		if (size && size !== "اختر" && apiData.sizes?.length > 0) {
			selectedOptions.push({
				option_name: "المقاس",
				option_value: size,
			});
		}

		if (color && color !== "اختر" && apiData.colors?.length > 0) {
			selectedOptions.push({
				option_name: "اللون",
				option_value: color,
			});
		}

		if (material && material !== "اختر" && apiData.materials?.length > 0) {
			selectedOptions.push({
				option_name: "الخامة",
				option_value: material,
			});
		}

		Object.entries(selectedFeatures).forEach(([name, val]) => {
			if (name && val && val !== "اختر") {
				selectedOptions.push({
					option_name: "خاصية",
					option_value: `${name}: ${val}`,
				});
			}
		});

		const updates: any = {
			selected_options: selectedOptions,
		};

		if (size && size !== "اختر" && apiData.sizes?.length > 0) {
			const selectedSize = apiData.sizes.find((s: any) => s.name === size);
			if (selectedSize?.id) updates.size_id = selectedSize.id;
			updates.size = size;
		}

		if (color && color !== "اختر" && apiData.colors?.length > 0) {
			const selectedColor = apiData.colors.find((c: any) => c.name === color);
			if (selectedColor?.id) updates.color_id = selectedColor.id;
			updates.color = selectedColor || { name: color };
		}

		if (material && material !== "اختر" && apiData.materials?.length > 0) {
			const selectedMaterial = apiData.materials.find((m: any) => m.name === material);
			if (selectedMaterial?.id) updates.material_id = selectedMaterial.id;
			updates.material = material;
		}

		try {
			const success = await updateCartItem(cartItemId, updates);
			if (success) {
				setSavedSuccessfully(true);
				setHasUnsavedChanges(false);
				setShowSaveButton(false);

				setTimeout(() => {
					setSavedSuccessfully(false);
				}, 3000);
			}
		} catch (error) {
			console.error("Failed to save options:", error);
		} finally {
			setSaving(false);
		}
	};

	const resetAllOptions = () => {
		setSize("اختر");
		setColor("اختر");
		setMaterial("اختر");

		const resetFeatures: { [key: string]: string } = {};
		if (apiData?.features) {
			apiData.features.forEach((feature: any) => {
				const hasValues = feature.value || (feature.values && feature.values.length > 0);
				if (hasValues) {
					resetFeatures[feature.name] = "اختر";
				}
			});
		}

		setSelectedFeatures(resetFeatures);
		setHasUnsavedChanges(true);
		setShowSaveButton(true);
		setSavedSuccessfully(false);
	};

	const handleOptionChange = (setter: Function, value: string, optionType: string) => {
		const oldValue = optionType === 'size' ? size : optionType === 'color' ? color : material;

		if (value !== oldValue) {
			setter(value);
			if (!cartItemId) {
				setHasUnsavedChanges(true);
			} else {
				setShowSaveButton(true);
				setHasUnsavedChanges(true);
				setSavedSuccessfully(false);
			}
		}
	};

	const handleSizeChange = (value: string) => {
		handleOptionChange(setSize, value, 'size');
	};

	const handleColorChange = (value: string) => {
		handleOptionChange(setColor, value, 'color');
	};

	const handleMaterialChange = (value: string) => {
		handleOptionChange(setMaterial, value, 'material');
	};

	const handleFeatureChange = (featureName: string, value: string) => {
		setSelectedFeatures(prev => {
			const newFeatures = { ...prev, [featureName]: value };

			if (cartItemId) {
				setHasUnsavedChanges(true);
				setShowSaveButton(true);
				setSavedSuccessfully(false);
			}

			return newFeatures;
		});
	};

	if (loading && formLoading) {
		return <StickerFormSkeleton  />;
	}

	if (!apiData) {
		return (
			<div className="border-t border-gray-100 pt-4 mt-4">
				<p className="text-gray-600 text-center p-4">لا توجد بيانات للمنتج</p>
			</div>
		);
	}

	const renderValidationIndicator = () => {
		const isValid = validateCurrentOptions();
		return (
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				className="mb-4"
			>
				<div className={`p-3 rounded-lg border ${isValid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
					<div className="flex items-center gap-2">
						{isValid ? (
							<CheckCircle className="text-green-600 text-sm" />
						) : (
							<Warning className="text-yellow-600 text-sm" />
						)}
						<p className={`text-sm ${isValid ? 'text-green-800' : 'text-yellow-800'}`}>
							{isValid ? '✓ جميع الخيارات صحيحة' : '⚠ خيارات مطلوبة'}
						</p>
					</div>
				</div>
			</motion.div>
		);
	};

	const renderSizesSelect = () => {
		if (!apiData?.sizes || apiData.sizes.length === 0) return null;

		const sizeOptions = apiData.sizes.map((sizeItem: any) => ({
			value: sizeItem.name,
			label: sizeItem.name,
		}));

		const hasSizes = apiData.sizes.length > 0;
		const isRequired = hasSizes;

		return (
			<Box display="flex" gap={2} alignItems="center" mb={3}>
				{/* <Box flex={1}>
					<Typography variant="subtitle1" fontWeight="bold" className="text-gray-800">
						المقاس{" "}
						{isRequired && <span style={{ color: "red" }}>*</span>}
					</Typography>
				</Box> */}
				<Box flex={2} position="relative">
					<FormControl
						fullWidth
						required={isRequired}
						size="small"
						error={isRequired && size === "اختر"}
					>
						<InputLabel>المقاس</InputLabel>
						<Select
							value={size}
							onChange={(e) => handleSizeChange(e.target.value)}
							label="المقاس"
							required={isRequired}
							className="bg-white"
						>
							<MenuItem value="اختر" disabled>
								<em className="text-gray-400">اختر</em>
							</MenuItem>
							{sizeOptions.map((opt: any) => (
								<MenuItem key={opt.value} value={opt.value}>
									{opt.label}
								</MenuItem>
							))}
						</Select>
						{isRequired && size === "اختر" && (
							<FormHelperText className="text-red-500 text-xs">
								يجب اختيار المقاس
							</FormHelperText>
						)}
					</FormControl>
				</Box>
			</Box>
		);
	};

	const renderColorsSelect = () => {
		if (!apiData?.colors || apiData.colors.length === 0) return null;

		const colorOptions = apiData.colors.map((colorItem: any) => ({
			value: colorItem.name,
			label: colorItem.name,
			hex: colorItem.hex_code,
		}));

		const hasColors = apiData.colors.length > 0;
		const isRequired = hasColors;

		return (
			<Box display="flex" gap={2} alignItems="center" mb={3}>
				{/* <Box flex={1}>
					<Typography variant="subtitle1" fontWeight="bold" className="text-gray-800">
						اللون{" "}
						{isRequired && <span style={{ color: "red" }}>*</span>}
					</Typography>
				</Box> */}
				<Box flex={2} position="relative">
					<FormControl
						fullWidth
						required={isRequired}
						size="small"
						error={isRequired && color === "اختر"}
					>
						<InputLabel>اللون</InputLabel>
						<Select
							value={color}
							onChange={(e) => handleColorChange(e.target.value)}
							label="اللون"
							required={isRequired}
							className="bg-white"
						>
							<MenuItem value="اختر" disabled>
								<em className="text-gray-400">اختر</em>
							</MenuItem>
							{colorOptions.map((opt: any) => (
								<MenuItem key={opt.value} value={opt.value}>
									<div className="flex items-center gap-2">
										{opt.hex && (
											<div
												className="w-4 h-4 rounded-full border border-gray-300"
												style={{ backgroundColor: opt.hex }}
											/>
										)}
										<span>{opt.label}</span>
									</div>
								</MenuItem>
							))}
						</Select>
						{isRequired && color === "اختر" && (
							<FormHelperText className="text-red-500 text-xs">
								يجب اختيار اللون
							</FormHelperText>
						)}
					</FormControl>
				</Box>
			</Box>
		);
	};

	const renderMaterialsSelect = () => {
		if (!apiData?.materials || apiData.materials.length === 0) return null;

		const materialOptions = apiData.materials.map((materialItem: any) => ({
			value: materialItem.name,
			label: materialItem.name,
		}));

		const hasMaterials = apiData.materials.length > 0;
		const isRequired = hasMaterials;

		return (
			<Box display="flex" gap={2} alignItems="center" mb={3}>
				{/* <Box flex={1}>
					<Typography variant="subtitle1" fontWeight="bold" className="text-gray-800">
						الخامة{" "}
						{isRequired && <span style={{ color: "red" }}>*</span>}
					</Typography>
				</Box> */}
				<Box flex={2} position="relative">
					<FormControl
						fullWidth
						required={isRequired}
						size="small"
						error={isRequired && material === "اختر"}
					>
						<InputLabel>الخامة</InputLabel>
						<Select
							value={material}
							onChange={(e) => handleMaterialChange(e.target.value)}
							label="الخامة"
							required={isRequired}
							className="bg-white"
						>
							<MenuItem value="اختر" disabled>
								<em className="text-gray-400">اختر</em>
							</MenuItem>
							{materialOptions.map((opt: any) => (
								<MenuItem key={opt.value} value={opt.value}>
									{opt.label}
								</MenuItem>
							))}
						</Select>
						{isRequired && material === "اختر" && (
							<FormHelperText className="text-red-500 text-xs">
								يجب اختيار الخامة
							</FormHelperText>
						)}
					</FormControl>
				</Box>
			</Box>
		);
	};

	const renderFeaturesSelects = () => {
		if (!apiData?.features || apiData.features.length === 0) return null;

		return apiData.features.map((feature: any, index: number) => {
			let options: { value: string; label: string }[] = [];

			if (feature.values && Array.isArray(feature.values) && feature.values.length > 0) {
				options = feature.values.map((val: string) => ({
					value: val,
					label: val,
				}));
			} else if (feature.value) {
				options = [{
					value: feature.value,
					label: feature.value,
				}];
			} else {
				return null;
			}

			const currentValue = selectedFeatures[feature.name] || "اختر";
			const hasValues = feature.value || (feature.values && feature.values.length > 0);
			const isRequired = hasValues;

			return (
				<Box key={index} display="flex" gap={2} alignItems="center" mb={3}>
					{/* <Box flex={1}>
						<Typography variant="subtitle1" fontWeight="bold" className="text-gray-800">
							{feature.name}{" "}
							{isRequired && <span style={{ color: "red" }}>*</span>}
						</Typography>
					</Box> */}
					<Box flex={2} position="relative">
						<FormControl
							fullWidth
							required={isRequired}
							size="small"
							error={isRequired && currentValue === "اختر"}
						>
							<InputLabel>{feature.name}</InputLabel>
							<Select
								value={currentValue}
								onChange={(e) => handleFeatureChange(feature.name, e.target.value)}
								label={feature.name}
								required={isRequired}
								className="bg-white"
 							>
								<MenuItem value="اختر" disabled>
									<em className="text-gray-600">اختر</em>
								</MenuItem>
								{options.map((opt: any) => (
									<MenuItem key={opt.value} value={opt.value}>
										{opt.label}
									</MenuItem>
								))}
							</Select>
							{isRequired && currentValue === "اختر" && (
								<FormHelperText className="text-red-500 text-xs">
									يجب اختيار {feature.name}
								</FormHelperText>
							)}
						</FormControl>
					</Box>
				</Box>
			);
		});
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="  pt-4 mt-4"
		>
			{/* {!cartItemId && showValidation && renderValidationIndicator()} */}


			{cartItemId && showSaveButton && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Warning className="text-yellow-600 text-sm" />
							<p className="text-sm text-yellow-800">لديك تغييرات غير محفوظة</p>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outlined"
								size="small"
								onClick={resetAllOptions}
								startIcon={<Refresh />}
								className="text-yellow-700 border-yellow-300"
							>
								إعادة تعيين
							</Button>
							<Button
								variant="contained"
								size="small"
								onClick={saveAllOptions}
								disabled={saving}
								startIcon={saving ? <CircularProgress size={16} /> : <Save />}
								className="bg-amber-500 hover:bg-amber-600 text-white"
							>
								{saving ? 'جاري الحفظ...' : 'حفظ'}
							</Button>
						</div>
					</div>
				</motion.div>
			)}

			{cartItemId && savedSuccessfully && (
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="mb-4"
				>
					<Alert
						severity="success"
						className="rounded-lg"
						icon={<CheckCircle />}
					>
						تم حفظ التغييرات بنجاح
					</Alert>
				</motion.div>
			)}

			<div className="space-y-4">
				{renderSizesSelect()}
				{renderColorsSelect()}
				{renderMaterialsSelect()}
				{renderFeaturesSelects()}
			</div>

			{apiData?.options_note && (
				<div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
					<div className="flex items-start gap-2">
						<Info className="text-blue-500 text-sm mt-0.5" />
						<p className="text-sm text-blue-700">{apiData.options_note}</p>
					</div>
				</div>
			)}
		</motion.div>
	);
});

StickerForm.displayName = 'StickerForm';

export default StickerForm;


 