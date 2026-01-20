package Computer.Engineering.Google.Text.Editor.util;

import java.security.SecureRandom;
import java.util.HashSet;
import java.util.Set;

public class CodeGenerator {
    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom random = new SecureRandom();
    private static final Set<String> usedCodes = new HashSet<>();

    public static synchronized String generateUniqueCode() {
        String code;
        int attempts = 0;
        do {
            code = generateCode();
            attempts++;
            if (attempts > 1000) {
                throw new RuntimeException("Unable to generate unique code after 1000 attempts");
            }
        } while (usedCodes.contains(code));
        
        usedCodes.add(code);
        return code;
    }

    private static String generateCode() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = random.nextInt(CHARACTERS.length());
            code.append(CHARACTERS.charAt(index));
        }
        return code.toString();
    }

    public static synchronized void releaseCode(String code) {
        usedCodes.remove(code);
    }

    public static synchronized boolean isCodeUsed(String code) {
        return usedCodes.contains(code);
    }
}
