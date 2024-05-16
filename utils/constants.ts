import { Platform } from "react-native";

const productSkus = Platform.select({
    android: [
        'monthly_sku', 'yearly_sku'
    ],
    ios: [
        'monthly_sku', 'yearly_sku'
    ],
})

export const constants = {
    productSkus
};