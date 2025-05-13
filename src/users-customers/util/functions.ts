
export function generatePincode(eventName: string): string {
    // Extract the first three letters of the event name (in uppercase)
    const eventPrefix = eventName.slice(0, 3).toUpperCase();
  
    // Generate a random 6-digit number
    const randomNumber = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0'); // Ensure it is always 6 digits
  
    // Combine the prefix and the random number to create the pincode
    const pincode = `${eventPrefix}${randomNumber}`;
  
    return pincode;
}

export function generateBarcodeId(): string {
    return 'CUS' + Math.floor(Math.random() * 10000000000000).toString()
}