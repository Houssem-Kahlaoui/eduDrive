package tn.enicarthage.eduDrive.controller;

import tn.enicarthage.eduDrive.dto.AdminRequest;
import tn.enicarthage.eduDrive.dto.AdminResponse;
import tn.enicarthage.eduDrive.model.Admin;
import tn.enicarthage.eduDrive.service.AdminService;

import java.util.List;
import java.util.stream.Collectors;

public class AdminController {
    private final AdminService service = new AdminService();

    public List<AdminResponse> getAll() {
        return service.getAll().stream()
                .map(AdminResponse::from)
                .collect(Collectors.toList());
    }

    public AdminResponse getById(Long id) {
        return AdminResponse.from(service.getById(id));
    }

    // ✅ La méthode update est de retour pour le profil
    public AdminResponse update(Long id, AdminRequest req) {
        Admin a = service.getById(id);
        
        a.setNom(req.nom);
        a.setPrenom(req.prenom);
        a.setEmail(req.email);
        a.setTelephone(req.telephone);        
        a.setActif(req.actif);
        
        if (req.password != null && !req.password.trim().isEmpty()) {
            a.setMotDePasse(req.password);
        }
        
        service.update(id, a);
        return AdminResponse.from(a);
    }
}