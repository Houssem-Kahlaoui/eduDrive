package tn.enicarthage.eduDrive.controller;

import tn.enicarthage.eduDrive.dao.ForfaitDAO;
import tn.enicarthage.eduDrive.dto.CandidatRequest;
import tn.enicarthage.eduDrive.dto.CandidatResponse;
import tn.enicarthage.eduDrive.dto.ChoixForfaitRequest;
import tn.enicarthage.eduDrive.exception.ResourceNotFoundException;
import tn.enicarthage.eduDrive.exception.ValidationException;
import tn.enicarthage.eduDrive.model.Candidat;
import tn.enicarthage.eduDrive.model.Forfait;
import tn.enicarthage.eduDrive.service.CandidatService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CandidatController {
    private final CandidatService service = new CandidatService();
    private final ForfaitDAO forfaitDAO = new ForfaitDAO();

    public List<CandidatResponse> getAll() {
        List<CandidatResponse> responses = new ArrayList<>();
        for (Candidat c : service.getAllCandidats()) {
            responses.add(toResponse(c));
        }
        return responses;
    }

    public CandidatResponse getById(Long id) {
        return toResponse(service.getCandidatById(id));
    }

    public CandidatResponse create(CandidatRequest req) {
        Candidat c = new Candidat();
        c.setNom(req.nom);
        c.setPrenom(req.prenom);
        c.setEmail(req.email);
        c.setMotDePasse(req.password);
        c.setTelephone(req.telephone);
        
        c.setForfaitId(req.forfaitId); 
        c.setDateNaissance(req.dateNaissance);
        c.setAdresse(req.adresse);
        c.setTypePermis(req.typePermis);
        c.setDateInscription(LocalDate.now());
        c.setStatutFormation("EN_COURS");
        c.setActif(req.actif);

        if (req.forfaitId != null) {
            Forfait f = forfaitDAO.findById(req.forfaitId);
            if (f != null) {
                c.setHeuresCodeRestantes(f.getHeuresCode());
                c.setHeuresConduiteRestantes(f.getHeuresConduite());
                c.setDateSouscription(LocalDate.now());
            }
        }
        service.createCandidat(c);
        return toResponse(c);
    }

    public CandidatResponse update(Long id, CandidatRequest req) {
        Candidat c = service.getCandidatById(id);
        
        c.setNom(req.nom);
        c.setPrenom(req.prenom);
        c.setEmail(req.email);
        c.setTelephone(req.telephone);
        c.setDateNaissance(req.dateNaissance);
        c.setAdresse(req.adresse);
        c.setTypePermis(req.typePermis);
        
        if (req.password != null && !req.password.trim().isEmpty()) {
            c.setMotDePasse(req.password);
        }

        c.setActif(req.actif);

        if (req.forfaitId != null && !req.forfaitId.equals(c.getForfaitId())) {
            Forfait f = forfaitDAO.findById(req.forfaitId);
            if (f != null) {
                c.setForfaitId(req.forfaitId);
                c.setHeuresCodeRestantes(f.getHeuresCode());
                c.setHeuresConduiteRestantes(f.getHeuresConduite());
                c.setDateSouscription(LocalDate.now());
            }
        } else if (req.forfaitId == null && c.getForfaitId() != null) {
            c.setForfaitId(null);
            c.setHeuresCodeRestantes(0);
            c.setHeuresConduiteRestantes(0);
            c.setDateSouscription(null);
        }

        service.updateCandidat(id, c);
        return toResponse(c);
    }

    public CandidatResponse choisirForfait(Long id, ChoixForfaitRequest req) {
        if (req.forfaitId == null) throw new ValidationException("Le forfait est obligatoire.");
        Forfait f = forfaitDAO.findById(req.forfaitId);
        if (f == null) throw new ResourceNotFoundException("Forfait introuvable : " + req.forfaitId);
        if (!f.isActif()) throw new ValidationException("Ce forfait n'est plus actif.");

        Candidat c = service.getCandidatById(id);
        c.setForfaitId(req.forfaitId);
        c.setHeuresCodeRestantes(f.getHeuresCode());
        c.setHeuresConduiteRestantes(f.getHeuresConduite());
        c.setDateSouscription(LocalDate.now());
        service.updateCandidat(id, c);
        return toResponse(c);
    }

    public void delete(Long id) { service.deleteCandidat(id); }

    private CandidatResponse toResponse(Candidat c) {
        CandidatResponse r = new CandidatResponse();
        r.id = c.getId();
        r.nom = c.getNom();
        r.prenom = c.getPrenom();
        r.email = c.getEmail();
        r.telephone = c.getTelephone();
        r.actif = c.isActif();
        r.forfaitId = c.getForfaitId();
        r.dateNaissance = c.getDateNaissance();
        r.statutFormation = c.getStatutFormation();
        r.dateValiditeCode = c.getDateValiditeCode();
        r.heuresCodeRestantes = c.getHeuresCodeRestantes();
        r.heuresConduiteRestantes = c.getHeuresConduiteRestantes();
        r.dossierComplet = c.isDossierComplet();
        if (c.getForfaitId() != null) {
            Forfait f = forfaitDAO.findById(c.getForfaitId());
            if (f != null) r.forfaitNom = f.getNom();
        }
        return r;
    }
}