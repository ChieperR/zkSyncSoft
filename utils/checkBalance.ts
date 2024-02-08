export const isBalanceError = (error: any) => {
    if (
        error.toString().includes('insufficient funds') ||
        error.toString().includes('exceeds the balance') ||
        error.toString().includes('Not enough balance') ||
        error.toString().includes('gas required exceeds allowance') ||
        error.toString().includes('insufficient balance') ||
        error?.response?.data?.description.includes('Not enough ETH balance')
    ) {
        return true
    }

    return false
}