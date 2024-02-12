export const isBalanceError = (error: any) => {
    const errorMessage = error?.toString();
    if (errorMessage && (
        errorMessage.includes('insufficient funds') ||
        errorMessage.includes('exceeds the balance') ||
        errorMessage.includes('Not enough balance') ||
        errorMessage.includes('gas required exceeds allowance') ||
        errorMessage.includes('insufficient balance')
    )) {
        return true;
    }

    const responseMessage = error.response?.data?.description;
    if (typeof responseMessage === 'string' && responseMessage.includes('Not enough ETH balance')) {
        return true;
    }

    return false
}