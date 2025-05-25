import { DeviceType } from "@huggingface/transformers/types/utils/devices";

const SUPPORTED_CHECKS: Partial<Record<DeviceType, () => Promise<boolean>>> = {
  // @ts-ignore
  webgpu: async () => Boolean(await navigator.gpu.requestAdapter()),
};

const getSupportedDevice = async (
  device: DeviceType | Array<DeviceType>,
): Promise<DeviceType> => {
  if (typeof device === "string") {
    return device;
  }

  for (const type of device) {
    const supported: boolean =
      type in SUPPORTED_CHECKS ? await SUPPORTED_CHECKS[type]!() : true;
    if (supported) {
      return type;
    }
  }

  // this should never happen. Even if there is no check in SUPPORTED_CHECKS for a device it would fallback to true
  return device[0];
};

export default getSupportedDevice;
